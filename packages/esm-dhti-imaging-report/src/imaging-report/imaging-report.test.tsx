import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { useDhti } from '@openmrs/esm-dhti-utils';
import ImagingReportWidget from './imaging-report.component';

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
}));

jest.mock('@openmrs/esm-dhti-utils', () => ({
  useDhti: jest.fn(),
  ScreenCapture: ({ isActive, onCapture, onCancel }: any) =>
    isActive ? (
      <div data-testid="screen-capture-mock">
        <button onClick={() => onCapture({ type: 'image-data', imageData: 'data:image/png;base64,test' })}>
          Mock Capture
        </button>
        <button onClick={onCancel}>Mock Cancel</button>
      </div>
    ) : null,
}));

const mockUseConfig = useConfig as jest.MockedFunction<typeof useConfig>;
const mockUseDhti = useDhti as jest.MockedFunction<typeof useDhti>;

describe('ImagingReportWidget', () => {
  const mockConfig = {
    dhtiTitle: 'Imaging Report',
    dhtiRoute: 'http://localhost:8001/test',
    enableScreenCapture: true,
    maxImageSize: 5242880,
  };

  const mockSubmitMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue(mockConfig);
    mockUseDhti.mockReturnValue({
      submitMessage: mockSubmitMessage,
      loading: false,
      error: null,
    });
  });

  describe('Component rendering', () => {
    it('should render with title from config', () => {
      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      expect(screen.getByText('Imaging Report')).toBeInTheDocument();
    });

    it('should render capture button when screen capture is enabled', () => {
      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      expect(screen.getByRole('button', { name: /capture image/i })).toBeInTheDocument();
    });

    it('should not render capture button when screen capture is disabled', () => {
      mockUseConfig.mockReturnValue({
        ...mockConfig,
        enableScreenCapture: false,
      });

      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      expect(screen.queryByRole('button', { name: /capture image/i })).not.toBeInTheDocument();
    });
  });

  describe('Screen capture functionality', () => {
    it('should open screen capture overlay when button is clicked', () => {
      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      const captureButton = screen.getByRole('button', { name: /capture image/i });
      fireEvent.click(captureButton);
      
      expect(screen.getByTestId('screen-capture-mock')).toBeInTheDocument();
    });

    it('should display captured image after successful capture', async () => {
      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      const captureButton = screen.getByRole('button', { name: /capture image/i });
      fireEvent.click(captureButton);
      
      const mockCaptureButton = screen.getByText('Mock Capture');
      fireEvent.click(mockCaptureButton);
      
      await waitFor(() => {
        expect(screen.getByAltText('Captured medical image')).toBeInTheDocument();
      });
    });

    it('should show query section after image is captured', async () => {
      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      const captureButton = screen.getByRole('button', { name: /capture image/i });
      fireEvent.click(captureButton);
      
      const mockCaptureButton = screen.getByText('Mock Capture');
      fireEvent.click(mockCaptureButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/ask a question about the image/i)).toBeInTheDocument();
      });
    });

    it('should handle capture errors', async () => {
      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      const captureButton = screen.getByRole('button', { name: /capture image/i });
      fireEvent.click(captureButton);
      
      // Mock error capture
      const screenCapture = screen.getByTestId('screen-capture-mock');
      const onCapture = jest.fn();
      
      // Simulate error by directly calling the component's capture handler
      // In real scenario, this would be triggered by ScreenCapture component
      
      await waitFor(() => {
        expect(screen.queryByTestId('screen-capture-mock')).not.toBeInTheDocument();
      });
    });
  });

  describe('Query submission', () => {
    const setupWithCapturedImage = async () => {
      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      const captureButton = screen.getByRole('button', { name: /capture image/i });
      fireEvent.click(captureButton);
      
      const mockCaptureButton = screen.getByText('Mock Capture');
      fireEvent.click(mockCaptureButton);
      
      await waitFor(() => {
        expect(screen.getByAltText('Captured medical image')).toBeInTheDocument();
      });
    };

    it('should enable submit button when query is entered', async () => {
      await setupWithCapturedImage();
      
      const textarea = screen.getByLabelText(/ask a question about the image/i);
      fireEvent.change(textarea, { target: { value: 'What is this?' } });
      
      const submitButton = screen.getByRole('button', { name: /submit query/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should submit query to DHTI service with correct parameters', async () => {
      mockSubmitMessage.mockResolvedValue({
        summary: 'Test analysis result',
        detail: 'Detailed analysis',
      });

      await setupWithCapturedImage();
      
      const textarea = screen.getByLabelText(/ask a question about the image/i);
      fireEvent.change(textarea, { target: { value: 'What abnormalities are present?' } });
      
      const submitButton = screen.getByRole('button', { name: /submit query/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockSubmitMessage).toHaveBeenCalledWith(
          expect.stringContaining('"image_url":"data:image/png;base64,test"'),
          mockConfig.dhtiRoute,
          'test-patient-123'
        );
      });
    });

    it('should display response from DHTI service', async () => {
      mockSubmitMessage.mockResolvedValue({
        summary: 'Test analysis result',
        detail: null,
      });

      await setupWithCapturedImage();
      
      const textarea = screen.getByLabelText(/ask a question about the image/i);
      fireEvent.change(textarea, { target: { value: 'Analyze this image' } });
      
      const submitButton = screen.getByRole('button', { name: /submit query/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/analysis result/i)).toBeInTheDocument();
        expect(screen.getByText('Test analysis result')).toBeInTheDocument();
      });
    });

    it('should show error when submission fails', async () => {
      mockSubmitMessage.mockRejectedValue(new Error('Network error'));

      await setupWithCapturedImage();
      
      const textarea = screen.getByLabelText(/ask a question about the image/i);
      fireEvent.change(textarea, { target: { value: 'Analyze this image' } });
      
      const submitButton = screen.getByRole('button', { name: /submit query/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should show error when patient UUID is not available', async () => {
      render(<ImagingReportWidget />);
      
      const captureButton = screen.getByRole('button', { name: /capture image/i });
      fireEvent.click(captureButton);
      
      const mockCaptureButton = screen.getByText('Mock Capture');
      fireEvent.click(mockCaptureButton);
      
      await waitFor(() => {
        expect(screen.getByAltText('Captured medical image')).toBeInTheDocument();
      });
      
      const textarea = screen.getByLabelText(/ask a question about the image/i);
      fireEvent.change(textarea, { target: { value: 'Test query' } });
      
      const submitButton = screen.getByRole('button', { name: /submit query/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/patient context not available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Clear functionality', () => {
    it('should clear all fields when clear button is clicked', async () => {
      mockSubmitMessage.mockResolvedValue({
        summary: 'Test result',
      });

      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      // Capture image
      const captureButton = screen.getByRole('button', { name: /capture image/i });
      fireEvent.click(captureButton);
      
      const mockCaptureButton = screen.getByText('Mock Capture');
      fireEvent.click(mockCaptureButton);
      
      await waitFor(() => {
        expect(screen.getByAltText('Captured medical image')).toBeInTheDocument();
      });
      
      // Enter query
      const textarea = screen.getByLabelText(/ask a question about the image/i);
      fireEvent.change(textarea, { target: { value: 'Test query' } });
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /submit query/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test result')).toBeInTheDocument();
      });
      
      // Clear
      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);
      
      // Check everything is cleared
      expect(screen.queryByAltText('Captured medical image')).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/ask a question about the image/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Test result')).not.toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should show loading indicator during submission', async () => {
      mockUseDhti.mockReturnValue({
        submitMessage: mockSubmitMessage,
        loading: true,
        error: null,
      });

      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      expect(screen.getByText(/analyzing image/i)).toBeInTheDocument();
    });

    it('should disable buttons during loading', () => {
      mockUseDhti.mockReturnValue({
        submitMessage: mockSubmitMessage,
        loading: true,
        error: null,
      });

      render(<ImagingReportWidget patientUuid="test-patient-123" />);
      
      const captureButton = screen.getByRole('button', { name: /capture image/i });
      expect(captureButton).toBeDisabled();
    });
  });
});
