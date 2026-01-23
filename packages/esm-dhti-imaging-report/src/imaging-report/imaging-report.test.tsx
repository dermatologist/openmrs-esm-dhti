import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { useDhti, useOrthanc } from '@openmrs/esm-dhti-utils';
import ImagingReportWidget from './imaging-report.component';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
}));

jest.mock('@openmrs/esm-dhti-utils', () => ({
  useDhti: jest.fn(),
  useOrthanc: jest.fn(),
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
const mockUseOrthanc = useOrthanc as jest.MockedFunction<typeof useOrthanc>;

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
    mockUseOrthanc.mockReturnValue({
      uploadImage: jest.fn().mockResolvedValue({ id: 'test-id', patientId: 'patient-123' }),
      fetchPatientImages: jest.fn().mockResolvedValue([]),
      fetchInstanceById: jest.fn().mockResolvedValue(null),
      loading: false,
      error: null,
    } as any);
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

      // Verify the screen capture mock is shown
      await waitFor(() => {
        expect(screen.getByTestId('screen-capture-mock')).toBeInTheDocument();
      });

      // Click the cancel button to hide the capture UI
      const cancelButton = screen.getByRole('button', { name: /mock cancel/i });
      fireEvent.click(cancelButton);

      // The capture UI should be hidden after cancel
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
        expect(screen.getByRole('heading', { name: /analysis result/i })).toBeInTheDocument();
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
        expect(screen.getByText('Network error')).toBeInTheDocument();
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
        expect(screen.getAllByText(/patient context not available/i).length).toBeGreaterThan(0);
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
