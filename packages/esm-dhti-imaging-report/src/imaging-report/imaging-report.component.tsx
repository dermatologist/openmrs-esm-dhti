import React, { useState, useCallback } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { Button, TextArea, Stack, InlineLoading } from '@carbon/react';
import { Camera, Send } from '@carbon/icons-react';
import { ScreenCapture, type ScreenCaptureResult, useDhti } from '@openmrs/esm-dhti-utils';
import type { Config } from '../config-schema';
import styles from './imaging-report.scss';

/**
 * ImagingReportWidgetProps
 * Props injected by the OpenMRS framework when the widget is rendered in a patient context
 */
interface ImagingReportWidgetProps {
  patientUuid?: string;
}

/**
 * ImagingReportWidget Component
 * 
 * This component provides GenAI-powered imaging analysis and reporting capabilities.
 * It allows users to:
 * - Capture screen areas or extract image URLs using the ScreenCapture component
 * - Ask queries about the captured images
 * - Submit the image and query to the DHTI backend for AI-powered analysis
 * - Display the GenAI-generated response
 * 
 * The widget is designed to be displayed in the patient chart's imaging dashboard slot.
 */
const ImagingReportWidget: React.FC<ImagingReportWidgetProps> = ({ patientUuid }) => {
  const config = useConfig() as Config;
  const { submitMessage, loading, error: dhtiError } = useDhti();

  // Component state
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle screen capture completion
   */
  const handleCapture = useCallback((result: ScreenCaptureResult) => {
    setError(null);
    
    if (result.error) {
      setError(result.error);
      setIsCapturing(false);
      return;
    }

    if (result.type === 'image-data' && result.imageData) {
      // Check image size
      const sizeInBytes = Math.round((result.imageData.length * 3) / 4);
      if (sizeInBytes > config.maxImageSize) {
        setError(`Image size (${(sizeInBytes / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size (${(config.maxImageSize / 1024 / 1024).toFixed(2)} MB)`);
        setIsCapturing(false);
        return;
      }
      
      setCapturedImageUrl(result.imageData);
    } else if (result.type === 'image-url' && result.imageUrl) {
      setCapturedImageUrl(result.imageUrl);
    }

    setIsCapturing(false);
  }, [config.maxImageSize]);

  /**
   * Handle form submission - send image and query to DHTI backend
   */
  const handleSubmit = useCallback(async () => {
    if (!capturedImageUrl) {
      setError('Please capture an image first');
      return;
    }

    if (!query.trim()) {
      setError('Please enter a query about the image');
      return;
    }

    if (!patientUuid) {
      setError('Patient context not available');
      return;
    }

    setError(null);
    setResponse(null);

    try {
      // Prepare the context input as JSON
      const contextInput = JSON.stringify({
        image_url: capturedImageUrl,
        text: query.trim(),
      });

      // Submit to DHTI service
      const result = await submitMessage(
        contextInput,
        config.dhtiRoute,
        patientUuid
      );

      if (result) {
        // Display the response
        setResponse(result.summary || 'Analysis completed successfully');
        
        // If there's detail text, append it
        if (result.detail) {
          setResponse(prev => `${prev}\n\n${result.detail}`);
        }
      } else {
        setError('No response received from the analysis service');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    }
  }, [capturedImageUrl, query, patientUuid, config.dhtiRoute, submitMessage]);

  /**
   * Handle clearing the form
   */
  const handleClear = useCallback(() => {
    setCapturedImageUrl(null);
    setQuery('');
    setResponse(null);
    setError(null);
  }, []);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{config.dhtiTitle}</h3>

      {/* Screen Capture Section */}
      {config.enableScreenCapture && (
        <div className={styles.captureSection}>
          <Button
            kind="tertiary"
            size="md"
            renderIcon={Camera}
            onClick={() => setIsCapturing(true)}
            disabled={isCapturing || loading}
          >
            {capturedImageUrl ? 'Recapture Image' : 'Capture Image'}
          </Button>

          {capturedImageUrl && (
            <div className={styles.imagePreview}>
              <img 
                src={capturedImageUrl} 
                alt="Captured medical image" 
                className={styles.previewImage}
              />
            </div>
          )}
        </div>
      )}

      {/* Query Input Section */}
      {capturedImageUrl && (
        <div className={styles.querySection}>
          <TextArea
            id="imaging-query"
            labelText="Ask a question about the image"
            placeholder="e.g., What abnormalities can you identify in this imaging study?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            disabled={loading}
          />

          <Stack gap={5} orientation="horizontal" className={styles.actionButtons}>
            <Button
              kind="primary"
              size="md"
              renderIcon={Send}
              onClick={handleSubmit}
              disabled={loading || !query.trim()}
            >
              {loading ? 'Analyzing...' : 'Submit Query'}
            </Button>

            <Button
              kind="secondary"
              size="md"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
          </Stack>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingSection}>
          <InlineLoading description="Analyzing image..." />
        </div>
      )}

      {/* Error Display */}
      {(error || dhtiError) && (
        <div className={styles.errorSection}>
          <p className={styles.errorText}>
            <strong>Error:</strong> {error || dhtiError?.message}
          </p>
        </div>
      )}

      {/* Response Display */}
      {response && !loading && (
        <div className={styles.responseSection}>
          <h4 className={styles.responseTitle}>Analysis Result:</h4>
          <div className={styles.responseContent}>
            {response.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Screen Capture Component */}
      {isCapturing && (
        <ScreenCapture
          isActive={isCapturing}
          onCapture={handleCapture}
          onCancel={() => setIsCapturing(false)}
        />
      )}
    </div>
  );
};

export default ImagingReportWidget;
