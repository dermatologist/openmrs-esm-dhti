import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button, TextInput, Stack, InlineLoading, FileUploader } from '@carbon/react';
import { ChevronLeft, ChevronRight, Upload, FolderOpen } from '@carbon/react/icons';
import { useOrthanc, type OrthancImage } from '@openmrs/esm-dhti-utils';
import styles from './orthanc-viewer.scss';

/**
 * OrthancViewerProps
 * Props for the Orthanc DICOM viewer component
 */
export interface OrthancViewerProps {
  patientId: string;
  orthancUrl: string;
  onImageSelect?: (imageUrl: string) => void;
}

/**
 * OrthancViewer Component
 *
 * This component provides functionality to:
 * - View DICOM images from an Orthanc server for a specific patient
 * - Upload local PNG images to the Orthanc server
 * - Navigate through patient images
 * - Select images for analysis
 *
 * @example
 * ```tsx
 * <OrthancViewer
 *   patientId="patient-123"
 *   orthancUrl="http://localhost:8042"
 *   onImageSelect={(url) => console.log('Selected:', url)}
 * />
 * ```
 */
export const OrthancViewer: React.FC<OrthancViewerProps> = ({
  patientId,
  orthancUrl,
  onImageSelect,
}) => {
  const { uploadImage, fetchPatientImages, loading, error } = useOrthanc(orthancUrl);

  // Component state
  const [images, setImages] = useState<OrthancImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [studyDescription, setStudyDescription] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Display an image on the canvas
   */
  const displayImage = useCallback((image: OrthancImage | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !image?.imageData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);
    };
    img.src = image.imageData;

    // Notify parent component of selection
    if (onImageSelect) {
      onImageSelect(image.imageData);
    }
  }, [onImageSelect]);

  /**
   * Load all images for the current patient
   */
  const loadPatientImages = useCallback(async () => {
    if (!patientId) return;

    const fetchedImages = await fetchPatientImages(patientId);
    setImages(fetchedImages);

    if (fetchedImages.length > 0) {
      const newestIndex = fetchedImages.length - 1;
      setCurrentIndex(newestIndex);
      displayImage(fetchedImages[newestIndex]);
    }
  }, [patientId, fetchPatientImages, displayImage]);

  /**
   * Load patient images on component mount and when patientId changes
   */
  useEffect(() => {
    if (patientId) {
      loadPatientImages();
    }
  }, [patientId, loadPatientImages]);

  /**
   * Handle file selection for local image upload
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/png')) {
      setUploadError('Please select a PNG image file');
      return;
    }

    setLocalImageFile(file);
    setUploadError(null);
    setUploadSuccess(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setLocalImagePreview(imageData);

      // Display on canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = imageData;

      // Notify parent component
      if (onImageSelect) {
        onImageSelect(imageData);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  /**
   * Handle image upload to Orthanc server
   */
  const handleUpload = useCallback(async () => {
    if (!localImagePreview) {
      setUploadError('Please select an image file first');
      return;
    }

    setUploadSuccess(null);
    setUploadError(null);

    const result = await uploadImage({
      imageData: localImagePreview,
      patientId,
      patientName: patientName.trim() || undefined,
      studyDescription: studyDescription.trim() || 'Uploaded Image',
    });

    if (result) {
      setUploadSuccess(`Image uploaded successfully (ID: ${result.id})`);

      // Clear form
      setLocalImageFile(null);
      setLocalImagePreview(null);
      setPatientName('');
      setStudyDescription('');

      // Reload patient images after upload
      loadPatientImages();
    } else {
      setUploadError(error?.message || 'Failed to upload image');
    }
  }, [localImagePreview, patientId, patientName, studyDescription, uploadImage, error, loadPatientImages]);

  /**
   * Navigate to previous image
   */
  const handlePrevious = useCallback(() => {
    if (images.length === 0) return;

    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    displayImage(images[newIndex]);
  }, [images, currentIndex, displayImage]);

  /**
   * Navigate to next image
   */
  const handleNext = useCallback(() => {
    if (images.length === 0) return;

    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    displayImage(images[newIndex]);
  }, [images, currentIndex, displayImage]);

  /**
   * Display current image from server
   */
  useEffect(() => {
    if (images.length > 0 && images[currentIndex]) {
      displayImage(images[currentIndex]);
    }
  }, [currentIndex, images, displayImage]);

  const currentImage = images[currentIndex];

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>DICOM Image Viewer</h4>

      {/* Canvas for displaying images */}
      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.canvas} />

        {!localImagePreview && images.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <p>No images available. Upload an image to get started.</p>
          </div>
        )}
      </div>

      {/* Navigation controls for server images */}
      {images.length > 0 && !localImagePreview && (
        <div className={styles.navigation}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={ChevronLeft}
            iconDescription="Previous"
            hasIconOnly
            onClick={handlePrevious}
            disabled={loading}
          />

          <span className={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </span>

          <Button
            kind="ghost"
            size="sm"
            renderIcon={ChevronRight}
            iconDescription="Next"
            hasIconOnly
            onClick={handleNext}
            disabled={loading}
          />
        </div>
      )}

      {/* Current image metadata */}
      {currentImage && !localImagePreview && (
        <div className={styles.metadata}>
          <p><strong>Patient:</strong> {currentImage.patientName || currentImage.patientId}</p>
          {currentImage.studyDescription && (
            <p><strong>Study:</strong> {currentImage.studyDescription}</p>
          )}
          {currentImage.instanceDate && (
            <p><strong>Date:</strong> {currentImage.instanceDate}</p>
          )}
        </div>
      )}

      {/* Upload section */}
      <div className={styles.uploadSection}>
        <h5 className={styles.sectionTitle}>Upload New Image</h5>

        <div className={styles.fileInput}>
          <input
            type="file"
            accept="image/png"
            onChange={handleFileSelect}
            id="image-upload"
            style={{ display: 'none' }}
          />
          <Button
            kind="tertiary"
            size="md"
            renderIcon={FolderOpen}
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={loading}
          >
            Open Image File
          </Button>
          {localImageFile && (
            <span className={styles.fileName}>{localImageFile.name}</span>
          )}
        </div>

        {localImagePreview && (
          <Stack gap={5} className={styles.uploadForm}>
            <TextInput
              id="patient-name"
              labelText="Patient Name"
              placeholder="Enter patient name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              disabled={loading}
            />

            <TextInput
              id="study-description"
              labelText="Study Description"
              placeholder="e.g., Chest X-Ray"
              value={studyDescription}
              onChange={(e) => setStudyDescription(e.target.value)}
              disabled={loading}
            />

            <Button
              kind="primary"
              size="md"
              renderIcon={Upload}
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload to Orthanc'}
            </Button>
          </Stack>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className={styles.loadingSection}>
          <InlineLoading description="Processing..." />
        </div>
      )}

      {/* Success message */}
      {uploadSuccess && (
        <div className={styles.successMessage}>
          <p>{uploadSuccess}</p>
        </div>
      )}

      {/* Error messages */}
      {(error || uploadError) && (
        <div className={styles.errorMessage}>
          <p><strong>Error:</strong> {uploadError || error?.message}</p>
        </div>
      )}
    </div>
  );
};
