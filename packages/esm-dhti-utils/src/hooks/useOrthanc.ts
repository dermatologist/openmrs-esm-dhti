import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Orthanc DICOM Image metadata
 */
export interface OrthancImage {
  id: string;
  patientId: string;
  patientName?: string;
  studyDescription?: string;
  instanceDate?: string;
  imageData?: string; // Base64 encoded image data
}

/**
 * Parameters for uploading an image to Orthanc
 */
export interface UploadImageParams {
  imageData: string; // Base64 encoded PNG data
  patientId: string;
  patientName?: string;
  studyDescription?: string;
}

/**
 * Hook for interacting with Orthanc DICOM server
 *
 * Provides functionality to:
 * - Upload PNG images as DICOM files
 * - Fetch images for a given patient
 * - Navigate through patient images
 *
 * @param orthancUrl - Base URL of the Orthanc server (default: http://localhost:8042)
 * @param username - Optional username for basic auth
 * @param password - Optional password for basic auth
 *
 * @example
 * ```tsx
 * const { uploadImage, fetchPatientImages, loading, error } = useOrthanc('http://localhost:8042');
 *
 * const handleUpload = async () => {
 *   const result = await uploadImage({
 *     imageData: 'data:image/png;base64,...',
 *     patientId: 'patient-123',
 *     patientName: 'John Doe',
 *     studyDescription: 'Chest X-Ray'
 *   });
 *   if (result) {
 *     console.log('Upload successful:', result.id);
 *   }
 * };
 * ```
 */
export function useOrthanc(orthancUrl: string = 'http://localhost:8042', username?: string, password?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create axios instance with optional authentication
   */
  const getAxiosInstance = useCallback(() => {
    const config: any = {
      baseURL: orthancUrl,
      transformRequest: [
        (data) => {
          // Only transform JSON data, skip if already a string or undefined
          if (typeof data === 'string' || data === undefined) {
            return data;
          }
          return JSON.stringify(data);
        },
      ],
    };

    if (username && password) {
      config.auth = {
        username,
        password,
      };
    }

    return axios.create(config);
  }, [orthancUrl, username, password]);

  /**
   * Convert PNG base64 data to DICOM and upload to Orthanc
   *
   * Uses the /tools/create-dicom endpoint to convert PNG to DICOM format
   */
  const uploadImage = useCallback(
    async (params: UploadImageParams): Promise<OrthancImage | null> => {
      setLoading(true);
      setError(null);

      try {
        const axiosInstance = getAxiosInstance();

        // Extract base64 data from data URL
        let base64Data = params.imageData;
        if (base64Data.startsWith('data:image/png;base64,')) {
          base64Data = base64Data.replace('data:image/png;base64,', '');
        }

        // Prepare DICOM tags for the image
        const dicomData = {
          Tags: {
            PatientID: params.patientId,
            PatientName: params.patientName || params.patientId,
            StudyDescription: params.studyDescription || 'Uploaded Image',
            Modality: 'OT', // Other
            SeriesDescription: 'Uploaded PNG Image',
            InstanceNumber: '1',
          },
          Content: `data:image/png;base64,${base64Data}`,
        };

        // Upload to Orthanc using /tools/create-dicom endpoint
        // Note: Intentionally NOT setting Content-Type header to avoid CORS preflight OPTIONS
        const response = await axiosInstance.post('/tools/create-dicom', dicomData);

        // Handle response - may return 200 with no content or with instance ID
        const instanceId = response.data?.ID || `orthanc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        setLoading(false);

        return {
          id: instanceId,
          patientId: params.patientId,
          patientName: params.patientName,
          studyDescription: params.studyDescription,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to upload image to Orthanc');
        setError(error);
        setLoading(false);
        return null;
      }
    },
    [getAxiosInstance],
  );

  /**
   * Fetch all images for a given patient ID
   *
   * Uses the /tools/find endpoint to search for patient images
   */
  const fetchPatientImages = useCallback(
    async (patientId: string): Promise<OrthancImage[]> => {
      setLoading(true);
      setError(null);

      try {
        const axiosInstance = getAxiosInstance();

        // Use /tools/find to search for patient
        const findResponse = await axiosInstance.post('/tools/find', {
          Level: 'Instance',
          Query: {
            PatientID: patientId,
          },
          Expand: true,
        });

        const instances = findResponse.data;

        // Fetch details and preview for each instance
        const images: OrthancImage[] = [];

        for (const instance of instances) {
          try {
            // Get instance details including parent study/series
            const instanceId = instance.ID;
            const instanceDetails = await axiosInstance.get(`/instances/${instanceId}`);
            const tags = instanceDetails.data.MainDicomTags || {};

            // Get patient info from parent study
            let patientName: string | undefined;
            let studyDescription: string | undefined;

            try {
              if (instanceDetails.data.ParentStudy) {
                const studyDetails = await axiosInstance.get(`/studies/${instanceDetails.data.ParentStudy}`);
                const studyTags = studyDetails.data.MainDicomTags || {};
                patientName = studyTags.PatientName;
                studyDescription = studyTags.StudyDescription;
              }
            } catch (err) {
              console.warn(`Failed to get study details for ${instanceId}:`, err);
            }

            // Fetch preview image (PNG format) with a separate non-transforming instance
            const binaryAxios = axios.create({ baseURL: orthancUrl });
            if (username && password) {
              binaryAxios.defaults.auth = { username, password };
            }

            const previewResponse = await binaryAxios.get(`/instances/${instanceId}/preview`, {
              responseType: 'arraybuffer',
              transformResponse: [(data) => data], // Disable default JSON parsing
            });

            // Convert to base64
            const base64Image = Buffer.isBuffer(previewResponse.data)
              ? previewResponse.data.toString('base64')
              : Buffer.from(previewResponse.data, 'binary').toString('base64');
            const imageData = `data:image/png;base64,${base64Image}`;

            images.push({
              id: instanceId,
              patientId: tags.PatientID || instance.PatientId,
              patientName: patientName,
              studyDescription: studyDescription || tags.StudyDescription,
              instanceDate: tags.InstanceCreationDate,
              imageData,
            });
          } catch (err) {
            // Skip instances that fail to load
            console.warn(`Failed to load instance ${instance.ID}:`, err);
          }
        }

        setLoading(false);
        return images;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch patient images from Orthanc');
        setError(error);
        setLoading(false);
        return [];
      }
    },
    [getAxiosInstance],
  );

  /**
   * Fetch a specific instance by ID
   */
  const fetchInstanceById = useCallback(
    async (instanceId: string): Promise<OrthancImage | null> => {
      setLoading(true);
      setError(null);

      try {
        const axiosInstance = getAxiosInstance();

        // Get instance details
        const instanceResponse = await axiosInstance.get(`/instances/${instanceId}`);
        const tags = instanceResponse.data.MainDicomTags || {};

        // Fetch preview image with separate plain axios (no transform)
        const binaryAxios = axios.create({ baseURL: orthancUrl });
        if (username && password) {
          binaryAxios.defaults.auth = { username, password };
        }

        const previewResponse = await binaryAxios.get(`/instances/${instanceId}/preview`, {
          responseType: 'arraybuffer',
          transformResponse: [(data) => data],
        });

        // Convert to base64
        const base64Image = Buffer.isBuffer(previewResponse.data)
          ? previewResponse.data.toString('base64')
          : Buffer.from(previewResponse.data, 'binary').toString('base64');
        const imageData = `data:image/png;base64,${base64Image}`;

        setLoading(false);

        return {
          id: instanceId,
          patientId: tags.PatientID,
          patientName: tags.PatientName,
          studyDescription: tags.StudyDescription,
          instanceDate: tags.InstanceCreationDate,
          imageData,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch instance from Orthanc');
        setError(error);
        setLoading(false);
        return null;
      }
    },
    [getAxiosInstance],
  );

  return {
    uploadImage,
    fetchPatientImages,
    fetchInstanceById,
    loading,
    error,
  };
}
