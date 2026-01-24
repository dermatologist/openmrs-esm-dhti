# @openmrs/esm-dhti-utils

Shared utilities for OpenMRS DHTI (Digital Health Transformation Initiative) microfrontends.

## Overview

This package provides common hooks, models, and utilities used across DHTI applications in the OpenMRS ecosystem. It helps reduce code duplication and ensures consistency across different DHTI microfrontends.

## Features

### Hooks

#### `usePatient(query: string)`

A custom hook to search for patients using the OpenMRS FHIR API. It automatically detects whether the query is a patient identifier (contains numbers) or a name search.

**Example:**
```typescript
import { usePatient } from '@openmrs/esm-dhti-utils';

function PatientSearch() {
  const { patient, error, isLoading } = usePatient('John Doe');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (patient) return <div>Found: {patient.name?.[0]?.text}</div>;

  return null;
}
```

#### `useOrthanc(orthancUrl, username?, password?)`

A custom hook to interact with Orthanc DICOM servers. It provides functionality to upload PNG images as DICOM files, fetch patient images, and navigate through medical imaging data.

**Example:**
```typescript
import { useOrthanc } from '@openmrs/esm-dhti-utils';

function DicomComponent() {
  const { uploadImage, fetchPatientImages, loading, error } = useOrthanc('http://localhost:8010/http://orthanc:8042');

  const handleUpload = async () => {
    const result = await uploadImage({
      imageData: 'data:image/png;base64,...',
      patientId: 'patient-123',
      patientName: 'John Doe',
      studyDescription: 'Chest X-Ray',
    });
    if (result) {
      console.log('Upload successful:', result.id);
    }
  };

  const handleFetch = async () => {
    const images = await fetchPatientImages('patient-123');
    console.log('Found images:', images.length);
  };

  return (
    <div>
      <button onClick={handleUpload} disabled={loading}>Upload Image</button>
      <button onClick={handleFetch} disabled={loading}>Fetch Images</button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

**API:**
- `uploadImage(params)`: Upload PNG image as DICOM file
- `fetchPatientImages(patientId)`: Fetch all images for a patient
- `fetchInstanceById(instanceId)`: Fetch a specific DICOM instance
- `loading`: Boolean indicating loading state
- `error`: Error object if operation fails

**Orthanc REST API Integration:**
- Uses `/tools/create-dicom` for PNG to DICOM conversion
- Uses `/tools/find` for patient image search
- Uses `/instances/{id}/preview` for image retrieval



### Components

#### `ScreenCapture`

A reusable component for capturing rectangular screen areas or extracting image URLs from the page.

**Features:**
- Left-click and drag to select a rectangular area for capture
- Right-click on an image to extract its URL
- Returns captured areas as base64-encoded image data (format: `data:image/png;base64,{base64_image}`)
- Supports keyboard shortcuts (ESC to cancel)
- Works across different screen sizes and resolutions
- Proper error handling for edge cases

**Props:**

- `isActive` (boolean, required): Whether the capture mode is active
- `onCapture` (function, required): Callback function called when a capture is completed
- `onCancel` (function, optional): Callback when capture mode is cancelled
- `className` (string, optional): Custom class name for the overlay
- `children` (ReactNode, optional): Children to render inside the component

**Example:**
```typescript
import { useState } from 'react';
import { ScreenCapture, type ScreenCaptureResult } from '@openmrs/esm-dhti-utils';

function MyComponent() {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = (result: ScreenCaptureResult) => {
    if (result.error) {
      console.error('Capture failed:', result.error);
    } else if (result.type === 'image-data') {
      console.log('Captured image:', result.imageData);
      // result.imageData contains base64 encoded PNG
    } else if (result.type === 'image-url') {
      console.log('Image URL:', result.imageUrl);
    }
    setIsCapturing(false);
  };

  return (
    <div>
      <button onClick={() => setIsCapturing(true)}>Start Screen Capture</button>
      <ScreenCapture
        isActive={isCapturing}
        onCapture={handleCapture}
        onCancel={() => setIsCapturing(false)}
      />
    </div>
  );
}
```

**Result Types:**

```typescript
interface ScreenCaptureResult {
  type: 'image-data' | 'image-url';
  imageData?: string;  // For rectangular captures (base64 PNG)
  imageUrl?: string;   // For right-click image URL extraction
  error?: string;      // Error message if capture failed
}
```

### Models

#### `CDSHookCard`

Represents a CDS Hooks card with summary, detail, indicator, source, and links.

#### `CDSHookRequest`

Represents a request to a CDS Hooks service with hook instance, FHIR server details, and context.

## Installation

This package is designed to be used within the DHTI monorepo:

```bash
yarn add @openmrs/esm-dhti-utils@workspace:*
```

## Development

```bash
# Run tests
yarn test

# Run linter
yarn lint

# Type check
yarn typescript
```

## License

MPL-2.0
