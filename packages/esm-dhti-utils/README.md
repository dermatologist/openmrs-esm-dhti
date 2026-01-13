# @openmrs/esm-dhti-utils

Shared utilities for OpenMRS DHTI (Digital Health Technology for India) microfrontends.

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
