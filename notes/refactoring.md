# Refactoring Notes

## Overview

This document describes the refactoring work done to reduce code duplication in the OpenMRS ESM DHTI monorepo.

## Changes Made

### 1. Created Shared Utilities Package (`esm-dhti-utils`)

A new package was created to house shared code that was previously duplicated across multiple packages.

**Location**: `packages/esm-dhti-utils/`

**Contents**:
- **Hooks**:
  - `usePatient`: Hook for searching patients via OpenMRS FHIR API
  - `useDhti`: Hook for interacting with DHTI CDS Hooks services
  
- **Models**:
  - `CDSHookCard`: TypeScript model for CDS Hooks card responses
  - `CDSHookRequest`: TypeScript model for CDS Hooks requests

### 2. Removed Duplicate Code

The following duplicate files were removed:

**From `esm-chatbot-agent`**:
- `src/hooks/usePatient.ts` (duplicate)
- `src/hooks/useDhti.ts` (duplicate)
- `src/models/card.ts` (duplicate)
- `src/models/request.ts` (duplicate)

**From `esm-generic-display`**:
- `src/hooks/usePatient.ts` (duplicate)
- `src/hooks/useDhti.ts` (duplicate)
- `src/models/card.ts` (duplicate)
- `src/models/request.ts` (duplicate)

**From `esm-starter-app`**:
- `src/patient-getter/patient-getter.resource.ts` (replaced by shared `usePatient` hook)

### 3. Updated Package Dependencies

All packages that previously had duplicate code now depend on `@openmrs/esm-dhti-utils`:

```json
{
  "dependencies": {
    "@openmrs/esm-dhti-utils": "workspace:*"
  }
}
```

### 4. Updated Import Statements

Import statements were updated across all packages:

**Before**:
```typescript
import { usePatient } from '../hooks/usePatient';
import { useDhti } from '../hooks/useDhti';
```

**After**:
```typescript
import { usePatient, useDhti } from '@openmrs/esm-dhti-utils';
```

### 5. Added Comprehensive Unit Tests

**esm-dhti-utils tests** (31 tests, all passing):
- `usePatient.test.ts`: Tests for patient search hook
- `useDhti.test.ts`: Tests for DHTI service hook
- `card.test.ts`: Tests for CDS Hooks card model
- `request.test.ts`: Tests for CDS Hooks request model

**esm-chatbot-agent tests** (2 new tests):
- `MessageInput.test.tsx`: Tests for message input component
- `conversation.component.test.tsx`: Tests for conversation component

**esm-generic-display tests** (1 new test):
- `display.component.test.tsx`: Tests for display widget component

## Benefits

1. **Reduced Code Duplication**: Eliminated ~500 lines of duplicate code
2. **Single Source of Truth**: Shared utilities are now maintained in one place
3. **Improved Maintainability**: Bug fixes and enhancements only need to be made once
4. **Better Type Safety**: TypeScript models ensure consistency across packages
5. **Increased Test Coverage**: Comprehensive tests for all shared utilities
6. **Easier Onboarding**: New developers can understand the architecture more easily

## Implementation Details

### usePatient Hook

The `usePatient` hook was enhanced during consolidation:
- Supports both name-based and identifier-based patient searches
- Automatically detects search type based on query content (presence of numbers)
- Uses URL encoding for query parameters
- Returns patient data, loading state, and error state

### useDhti Hook

The `useDhti` hook provides:
- State management for loading and error states
- Flexible configuration via OpenMRS config system
- Support for custom service names
- Handles both card arrays and direct card responses

## Migration Guide

For developers working on this codebase:

### Using Shared Utilities

1. Add dependency to your package.json:
   ```json
   {
     "dependencies": {
       "@openmrs/esm-dhti-utils": "workspace:*"
     }
   }
   ```

2. Import from the shared package:
   ```typescript
   import { usePatient, useDhti, CDSHookCard } from '@openmrs/esm-dhti-utils';
   ```

3. Run `yarn install` to update dependencies

### Adding New Shared Utilities

If you find code that should be shared:

1. Add it to the appropriate location in `esm-dhti-utils/src/`
2. Export it from `esm-dhti-utils/src/index.ts`
3. Add comprehensive unit tests
4. Update this documentation

## Testing

Run tests for all packages:
```bash
yarn turbo run test
```

Run tests for specific package:
```bash
yarn turbo run test --filter=@openmrs/esm-dhti-utils
```

Run tests with coverage:
```bash
yarn turbo run coverage
```

## Build System

The monorepo uses:
- **Yarn Workspaces**: For dependency management
- **Turborepo**: For build orchestration and caching
- **Jest**: For unit testing
- **SWC**: For fast TypeScript compilation

## Future Improvements

1. Add more shared utilities as patterns emerge
2. Create shared UI components if duplication is found
3. Implement shared configuration utilities
4. Add integration tests for cross-package interactions
5. Consider extracting shared types to a separate types package

## References

- [OpenMRS ESM Framework Documentation](https://openmrs.github.io/openmrs-esm-core/)
- [CDS Hooks Specification](https://cds-hooks.org/)
- [FHIR Patient Resource](https://www.hl7.org/fhir/patient.html)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [Turborepo](https://turborepo.com/)
