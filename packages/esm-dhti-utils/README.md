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

#### `useDhti()`

A custom hook to interact with DHTI CDS Hooks services. It manages the submission of messages and handles loading/error states.

**Example:**
```typescript
import { useDhti } from '@openmrs/esm-dhti-utils';

function DhtiComponent() {
  const { submitMessage, loading, error } = useDhti();

  const handleSubmit = async () => {
    const result = await submitMessage('Patient symptoms', 'dhti_service', 'patient-123');
    if (result) {
      console.log('Response:', result.summary);
    }
  };

  return <button onClick={handleSubmit} disabled={loading}>Submit</button>;
}
```

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
