import { renderHook, waitFor, act } from '@testing-library/react';
import { useOrthanc } from './useOrthanc';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useOrthanc', () => {
  const mockOrthancUrl = 'http://localhost:8010/http://orthanc:8042';
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  describe('uploadImage', () => {
    it('should successfully upload an image', async () => {
      const mockResponse = {
        data: {
          ID: 'instance-123',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadImage({
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg',
          patientId: 'patient-123',
          patientName: 'John Doe',
          studyDescription: 'Chest X-Ray',
        });
      });

      expect(uploadResult).not.toBeNull();
      expect(uploadResult?.id).toBe('instance-123');
      expect(uploadResult?.patientId).toBe('patient-123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/tools/create-dicom',
        expect.objectContaining({
          Tags: expect.objectContaining({
            PatientID: 'patient-123',
            PatientName: 'John Doe',
            StudyDescription: 'Chest X-Ray',
          }),
        }),
      );
    });

    it('should handle upload errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.uploadImage({
          imageData: 'data:image/png;base64,test',
          patientId: 'patient-123',
        });
      });

      expect(uploadResult).toBeNull();
      expect(result.current.error).not.toBeNull();
    });

    it('should strip data URL prefix from image data', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { ID: 'test-id' } });

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      await act(async () => {
        await result.current.uploadImage({
          imageData: 'data:image/png;base64,testdata',
          patientId: 'patient-123',
        });
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/tools/create-dicom',
        expect.objectContaining({
          Content: 'data:image/png;base64,testdata',
        }),
      );
    });
  });

  describe('fetchPatientImages', () => {
    it('should fetch all images for a patient', async () => {
      const mockFindResponse = {
        data: [
          {
            ID: 'instance-1',
            MainDicomTags: {
              PatientID: 'patient-123',
            },
          },
        ],
      };

      const mockInstanceDetailsResponse = {
        data: {
          MainDicomTags: {
            PatientID: 'patient-123',
          },
        },
      };

      const mockPreviewResponse = {
        data: Buffer.from('mock-image-data'),
      };

      mockAxiosInstance.post.mockResolvedValue(mockFindResponse);
      mockAxiosInstance.get.mockResolvedValue(mockInstanceDetailsResponse);

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let images;
      await act(async () => {
        images = await result.current.fetchPatientImages('patient-123');
      });

      expect(images).toHaveLength(1);
      expect(images![0].id).toBe('instance-1');
      expect(images![0].patientId).toBe('patient-123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tools/find', {
        Level: 'Instance',
        Query: {
          PatientID: 'patient-123',
        },
        Expand: true,
      });
    });

    it('should return empty array on fetch error', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let images;
      await act(async () => {
        images = await result.current.fetchPatientImages('patient-123');
      });

      expect(images).toEqual([]);
      expect(result.current.error).not.toBeNull();
    });

    it('should skip instances that fail to load', async () => {
      const mockFindResponse = {
        data: [
          {
            ID: 'instance-1',
            MainDicomTags: {
              PatientID: 'patient-123',
            },
          },
          {
            ID: 'instance-2',
            MainDicomTags: {
              PatientID: 'patient-123',
            },
          },
        ],
      };

      mockAxiosInstance.post.mockResolvedValue(mockFindResponse);
      // Set up get calls: 2 successful for instance-1, then 1 fails for instance-2
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { MainDicomTags: { PatientID: 'patient-123' } } })
        .mockResolvedValueOnce({ data: Buffer.from('image-1') })
        .mockRejectedValueOnce(new Error('Failed to load instance'));

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let images;
      await act(async () => {
        images = await result.current.fetchPatientImages('patient-123');
      });

      expect(images).toHaveLength(1);
      expect(images![0].id).toBe('instance-1');
    });
  });

  describe('fetchInstanceById', () => {
    it('should fetch a specific instance', async () => {
      const mockInstanceResponse = {
        data: {
          MainDicomTags: {
            PatientID: 'patient-123',
            PatientName: 'John Doe',
            StudyDescription: 'Chest X-Ray',
          },
        },
      };

      const mockPreviewResponse = {
        data: Buffer.from('mock-image-data'),
      };

      mockAxiosInstance.get.mockResolvedValueOnce(mockInstanceResponse).mockResolvedValueOnce(mockPreviewResponse);

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let instance;
      await act(async () => {
        instance = await result.current.fetchInstanceById('instance-123');
      });

      expect(instance).not.toBeNull();
      expect(instance?.id).toBe('instance-123');
      expect(instance?.patientId).toBe('patient-123');
    });

    it('should handle instance fetch error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Not found'));

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let instance;
      await act(async () => {
        instance = await result.current.fetchInstanceById('instance-123');
      });

      expect(instance).toBeNull();
      expect(result.current.error).not.toBeNull();
    });
  });

  describe('deleteImage', () => {
    it('should successfully delete an image', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ status: 200 });

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteImage('instance-123');
      });

      expect(deleteResult).toBe(true);
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/instances/instance-123');
      expect(result.current.error).toBeNull();
    });

    it('should handle delete errors', async () => {
      mockAxiosInstance.delete.mockRejectedValue(new Error('Forbidden'));

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteImage('instance-123');
      });

      expect(deleteResult).toBe(false);
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('Forbidden');
    });

    it('should return false on axios error', async () => {
      const axiosError = new Error('Network error');
      (axiosError as any).isAxiosError = true;
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteImage('instance-123');
      });

      expect(deleteResult).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    it('should set loading state during deletion', async () => {
      mockAxiosInstance.delete.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 100)),
      );

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let deletePromise;
      act(() => {
        deletePromise = result.current.deleteImage('instance-123');
      });

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await deletePromise;

      // Should not be loading after completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('authentication', () => {
    it('should create axios instance with authentication when credentials provided', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { ID: 'test' } });

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl, 'username', 'password'));

      await act(async () => {
        await result.current.uploadImage({
          imageData: 'data:image/png;base64,test',
          patientId: 'patient-123',
        });
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: {
            username: 'username',
            password: 'password',
          },
        }),
      );
    });

    it('should create axios instance without authentication when credentials not provided', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { ID: 'test' } });

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      await act(async () => {
        await result.current.uploadImage({
          imageData: 'data:image/png;base64,test',
          patientId: 'patient-123',
        });
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.not.objectContaining({
          auth: expect.anything(),
        }),
      );
    });
  });

  describe('loading state', () => {
    it('should set loading state during upload', async () => {
      mockAxiosInstance.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { ID: 'test' } }), 100)),
      );

      const { result } = renderHook(() => useOrthanc(mockOrthancUrl));

      let uploadPromise;
      act(() => {
        uploadPromise = result.current.uploadImage({
          imageData: 'data:image/png;base64,test',
          patientId: 'patient-123',
        });
      });

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await uploadPromise;

      // Should not be loading after completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
