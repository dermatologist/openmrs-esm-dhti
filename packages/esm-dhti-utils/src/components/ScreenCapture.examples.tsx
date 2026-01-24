/**
 * Example usage of the ScreenCapture component
 * This file demonstrates how to integrate the ScreenCapture component into your application
 */

import React, { useState } from 'react';
import { ScreenCapture, type ScreenCaptureResult } from '@openmrs/esm-dhti-utils';

/**
 * Basic example - Simple screen capture button
 */
export function BasicScreenCaptureExample() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (result: ScreenCaptureResult) => {
    if (result.error) {
      // eslint-disable-next-line no-console
      console.error('Capture failed:', result.error);
      alert(`Error: ${result.error}`);
    } else if (result.type === 'image-data' && result.imageData) {
      // eslint-disable-next-line no-console
      console.log('Image captured successfully');
      setCapturedImage(result.imageData);
    } else if (result.type === 'image-url' && result.imageUrl) {
      // eslint-disable-next-line no-console
      console.log('Image URL extracted:', result.imageUrl);
      alert(`Image URL: ${result.imageUrl}`);
    }
    setIsCapturing(false);
  };

  return (
    <div>
      <button onClick={() => setIsCapturing(true)}>
        Start Screen Capture
      </button>

      {capturedImage && (
        <div>
          <h3>Captured Image:</h3>
          <img src={capturedImage} alt="Captured" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        </div>
      )}

      <ScreenCapture
        isActive={isCapturing}
        onCapture={handleCapture}
        onCancel={() => setIsCapturing(false)}
      />
    </div>
  );
}

/**
 * Advanced example - Multiple captures with gallery
 */
export function AdvancedScreenCaptureExample() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (result: ScreenCaptureResult) => {
    if (result.error) {
      setError(result.error);
      // eslint-disable-next-line no-console
      console.error('Capture failed:', result.error);
    } else if (result.type === 'image-data' && result.imageData) {
      setCapturedImages(prev => [...prev, result.imageData!]);
      setError(null);
    } else if (result.type === 'image-url' && result.imageUrl) {
      // eslint-disable-next-line no-console
      console.log('Image URL:', result.imageUrl);
      // You could also add the URL to the gallery
      setCapturedImages(prev => [...prev, result.imageUrl!]);
      setError(null);
    }
    setIsCapturing(false);
  };

  const handleDelete = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setCapturedImages([]);
    setError(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setIsCapturing(true)}
          style={{ marginRight: '10px' }}
        >
          Capture Screenshot
        </button>
        <button onClick={handleClear}>
          Clear All
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      {capturedImages.length > 0 && (
        <div>
          <h3>Captured Images ({capturedImages.length}):</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {capturedImages.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', border: '1px solid #ccc', padding: '5px' }}>
                <img 
                  src={img} 
                  alt={`Capture ${idx + 1}`} 
                  style={{ width: '100%', height: 'auto' }} 
                />
                <button 
                  onClick={() => handleDelete(idx)}
                  style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: 'red', 
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '25px',
                    height: '25px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScreenCapture
        isActive={isCapturing}
        onCapture={handleCapture}
        onCancel={() => setIsCapturing(false)}
      />
    </div>
  );
}

/**
 * Medical record example - Capture and annotate patient images
 */
export function MedicalRecordCaptureExample() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const handleCapture = (result: ScreenCaptureResult) => {
    if (result.error) {
      // eslint-disable-next-line no-console
      console.error('Capture failed:', result.error);
    } else if (result.type === 'image-data' && result.imageData) {
      setCapturedImage(result.imageData);
    }
    setIsCapturing(false);
  };

  const handleSave = async () => {
    if (!capturedImage) return;

    // Convert base64 to blob
    const blob = await fetch(capturedImage).then(r => r.blob());

    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'capture.png');
    formData.append('notes', notes);
    formData.append('timestamp', new Date().toISOString());

    try {
      // Upload to server (example)
      // await fetch('/api/medical-records/images', {
      //   method: 'POST',
      //   body: formData,
      // });
      // eslint-disable-next-line no-console
      console.log('Image saved with notes:', notes);
      alert('Image saved successfully!');
      
      // Reset
      setCapturedImage(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to save image:', error);
      alert('Failed to save image');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Medical Record Image Capture</h2>
      
      <button onClick={() => setIsCapturing(true)}>
        Capture Medical Image
      </button>

      {capturedImage && (
        <div style={{ marginTop: '20px' }}>
          <img 
            src={capturedImage} 
            alt="Captured medical image" 
            style={{ maxWidth: '100%', border: '2px solid #007bff', marginBottom: '10px' }} 
          />
          
          <div>
            <label>
              Clinical Notes:
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                style={{ 
                  width: '100%', 
                  marginTop: '10px', 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                placeholder="Add clinical observations or notes..."
              />
            </label>
          </div>

          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={handleSave}
              style={{ marginRight: '10px' }}
            >
              Save to Medical Record
            </button>
            <button onClick={() => { setCapturedImage(null); setNotes(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ScreenCapture
        isActive={isCapturing}
        onCapture={handleCapture}
        onCancel={() => setIsCapturing(false)}
      />
    </div>
  );
}

/**
 * Usage with custom styling
 */
export function CustomStyledCaptureExample() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (result: ScreenCaptureResult) => {
    if (!result.error && result.type === 'image-data' && result.imageData) {
      setCapturedImage(result.imageData);
    }
    setIsCapturing(false);
  };

  return (
    <div>
      <button onClick={() => setIsCapturing(true)}>
        Custom Styled Capture
      </button>

      {capturedImage && (
        <img src={capturedImage} alt="Captured" />
      )}

      <ScreenCapture
        isActive={isCapturing}
        onCapture={handleCapture}
        onCancel={() => setIsCapturing(false)}
        className="custom-capture-overlay"
      >
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          Custom overlay content
        </div>
      </ScreenCapture>
    </div>
  );
}
