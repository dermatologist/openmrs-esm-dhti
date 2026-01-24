import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrthancViewer } from './orthanc-viewer.component';
import { useOrthanc } from '@openmrs/esm-dhti-utils';

// Mock the useOrthanc hook
jest.mock('@openmrs/esm-dhti-utils', () => ({
  useOrthanc: jest.fn(),
}));

const mockUseOrthanc = useOrthanc as jest.MockedFunction<typeof useOrthanc>;

describe('OrthancViewer', () => {
  const mockUploadImage = jest.fn();
  const mockFetchPatientImages = jest.fn();
  const mockOnImageSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseOrthanc.mockReturnValue({
      uploadImage: mockUploadImage,
      fetchPatientImages: mockFetchPatientImages,
      fetchInstanceById: jest.fn(),
      loading: false,
      error: null,
    });

    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
      fillRect: jest.fn(),
      clearRect: jest.fn(),
    })) as any;
  });

  describe('Component rendering', () => {
    it('should render the component with title', () => {
      mockFetchPatientImages.mockResolvedValue([]);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      expect(screen.getByText('DICOM Image Viewer')).toBeInTheDocument();
    });

    it('should show empty state when no images available', async () => {
      mockFetchPatientImages.mockResolvedValue([]);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/no images available/i)).toBeInTheDocument();
      });
    });

    it('should render upload section', () => {
      mockFetchPatientImages.mockResolvedValue([]);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      expect(screen.getByText('Upload New Image')).toBeInTheDocument();
      expect(screen.getByText('Open Image File')).toBeInTheDocument();
    });
  });

  describe('Image loading from server', () => {
    it('should fetch and display patient images on mount', async () => {
      const mockImages = [
        {
          id: 'instance-1',
          patientId: 'patient-123',
          patientName: 'John Doe',
          studyDescription: 'Chest X-Ray',
          imageData: 'data:image/png;base64,test1',
        },
      ];

      mockFetchPatientImages.mockResolvedValue(mockImages);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
          onImageSelect={mockOnImageSelect}
        />
      );

      await waitFor(() => {
        expect(mockFetchPatientImages).toHaveBeenCalledWith('patient-123');
      });

      await waitFor(() => {
        expect(screen.getByText('1 / 1')).toBeInTheDocument();
      });
    });

    it('should display image metadata', async () => {
      const mockImages = [
        {
          id: 'instance-1',
          patientId: 'patient-123',
          patientName: 'John Doe',
          studyDescription: 'Chest X-Ray',
          imageData: 'data:image/png;base64,test1',
        },
      ];

      mockFetchPatientImages.mockResolvedValue(mockImages);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Chest X-Ray/)).toBeInTheDocument();
      });
    });

    it('should navigate between images', async () => {
      const mockImages = [
        {
          id: 'instance-1',
          patientId: 'patient-123',
          patientName: 'John Doe',
          imageData: 'data:image/png;base64,test1',
        },
        {
          id: 'instance-2',
          patientId: 'patient-123',
          patientName: 'John Doe',
          imageData: 'data:image/png;base64,test2',
        },
      ];

      mockFetchPatientImages.mockResolvedValue(mockImages);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });

      // Click next button
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });

      // Click previous button
      const prevButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });
    });
  });

  describe('File upload', () => {
    it('should handle file selection', async () => {
      mockFetchPatientImages.mockResolvedValue([]);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      // Create a mock file
      const file = new File(['image content'], 'test.png', { type: 'image/png' });

      // Get the hidden file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: 'data:image/png;base64,testdata',
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      // Trigger file selection
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      // Simulate FileReader onload
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: mockFileReader } as any);
      }

      await waitFor(() => {
        expect(screen.getByText('test.png')).toBeInTheDocument();
      });
    });

    it('should show upload form after file selection', async () => {
      mockFetchPatientImages.mockResolvedValue([]);

      const { container } = render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      // Create a mock file
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: 'data:image/png;base64,testdata',
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      if (mockFileReader.onload) {
        mockFileReader.onload({ target: mockFileReader } as any);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/study description/i)).toBeInTheDocument();
        expect(screen.getByText(/upload to orthanc/i)).toBeInTheDocument();
      });
    });

    it('should upload image to Orthanc', async () => {
      mockFetchPatientImages.mockResolvedValue([]);
      mockUploadImage.mockResolvedValue({
        id: 'new-instance-123',
        patientId: 'patient-123',
      });

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      // Setup file
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: 'data:image/png;base64,testdata',
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      if (mockFileReader.onload) {
        mockFileReader.onload({ target: mockFileReader } as any);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
      });

      // Fill form
      const patientNameInput = screen.getByLabelText(/patient name/i);
      const studyDescInput = screen.getByLabelText(/study description/i);

      fireEvent.change(patientNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(studyDescInput, { target: { value: 'Test Study' } });

      // Upload
      const uploadButton = screen.getByText(/upload to orthanc/i);
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockUploadImage).toHaveBeenCalledWith({
          imageData: 'data:image/png;base64,testdata',
          patientId: 'patient-123',
          patientName: 'John Doe',
          studyDescription: 'Test Study',
        });
      });
    });

    it('should show success message after successful upload', async () => {
      mockFetchPatientImages.mockResolvedValue([]);
      mockUploadImage.mockResolvedValue({
        id: 'new-instance-123',
        patientId: 'patient-123',
      });

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      // Setup and upload file (abbreviated)
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: 'data:image/png;base64,testdata',
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      if (mockFileReader.onload) {
        mockFileReader.onload({ target: mockFileReader } as any);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/patient name/i), { target: { value: 'John Doe' } });
      fireEvent.click(screen.getByText(/upload to orthanc/i));

      await waitFor(() => {
        expect(screen.getByText(/image uploaded successfully/i)).toBeInTheDocument();
      });
    });

    it('should validate file type', async () => {
      mockFetchPatientImages.mockResolvedValue([]);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/please select a png image file/i)).toBeInTheDocument();
      });
    });

    it('should require patient name for upload', async () => {
      mockFetchPatientImages.mockResolvedValue([]);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      // Setup file without patient name
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: 'data:image/png;base64,testdata',
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      if (mockFileReader.onload) {
        mockFileReader.onload({ target: mockFileReader } as any);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
      });

      const uploadButton = screen.getByText(/upload to orthanc/i);
      expect(uploadButton).toBeDisabled();
    });
  });

  describe('Error handling', () => {
    it('should display error when upload fails', async () => {
      mockFetchPatientImages.mockResolvedValue([]);
      mockUseOrthanc.mockReturnValue({
        uploadImage: mockUploadImage,
        fetchPatientImages: mockFetchPatientImages,
        fetchInstanceById: jest.fn(),
        loading: false,
        error: new Error('Upload failed'),
      });

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Image selection callback', () => {
    it('should call onImageSelect when image is displayed', async () => {
      const mockImages = [
        {
          id: 'instance-1',
          patientId: 'patient-123',
          patientName: 'John Doe',
          imageData: 'data:image/png;base64,test1',
        },
      ];

      mockFetchPatientImages.mockResolvedValue(mockImages);

      render(
        <OrthancViewer
          patientId="patient-123"
          orthancUrl="http://localhost:8010/http://orthanc:8042"
          onImageSelect={mockOnImageSelect}
        />
      );

      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalledWith('data:image/png;base64,test1');
      });
    });
  });
});
