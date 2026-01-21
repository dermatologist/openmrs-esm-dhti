/**
 * @openmrs/esm-dhti-utils
 *
 * Shared utilities for OpenMRS DHTI (Digital Health Transformation Initiative) microfrontends.
 * This package provides common hooks, models, and utilities used across DHTI applications.
 *
 * @packageDocumentation
 */

// Hooks
export { usePatient } from './hooks/usePatient';
export { useDhti } from './hooks/useDhti';

// Models
export { CDSHookCard, CDSHookCardSource, CDSHookCardLink, type CDSHookCardIndicator } from './models/card';
export { CDSHookRequest } from './models/request';

// Components
export { ScreenCapture, type ScreenCaptureProps, type ScreenCaptureResult } from './components/ScreenCapture';
