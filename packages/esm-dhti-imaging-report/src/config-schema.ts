import { Type } from '@openmrs/esm-framework';

/**
 * This is the config schema for the imaging report module.
 * It defines the configuration options that can be set for this module.
 * 
 * Configuration options:
 * - dhtiTitle: Title for the imaging report widget
 * - dhtiRoute: DHTI service endpoint URL for imaging report analysis
 * - enableScreenCapture: Enable/disable screen capture functionality
 * - maxImageSize: Maximum image size allowed for capture in bytes
 * - orthancUrl: Base URL of the Orthanc DICOM server
 * - orthancUsername: Optional username for Orthanc authentication
 * - orthancPassword: Optional password for Orthanc authentication
 */
export const configSchema = {
  dhtiTitle: {
    _type: Type.String,
    _default: 'Imaging Report',
    _description: 'Title for the imaging report widget',
  },
  dhtiRoute: {
    _type: Type.String,
    _default: 'http://localhost:8001/langserve/dhti_elixir_imaging_report/cds-services/dhti-service',
    _description: 'DHTI service endpoint URL for imaging report analysis',
  },
  enableScreenCapture: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Enable screen capture functionality in the imaging report widget',
  },
  maxImageSize: {
    _type: Type.Number,
    _default: 5242880, // 5MB in bytes
    _description: 'Maximum image size allowed for capture in bytes',
  },
  orthancUrl: {
    _type: Type.String,
    _default: 'http://localhost:8042',
    _description: 'Base URL of the Orthanc DICOM server',
  },
  orthancUsername: {
    _type: Type.String,
    _default: '',
    _description: 'Optional username for Orthanc server authentication',
  },
  orthancPassword: {
    _type: Type.String,
    _default: '',
    _description: 'Optional password for Orthanc server authentication',
  },
};

export interface Config {
  dhtiTitle: string;
  dhtiRoute: string;
  enableScreenCapture: boolean;
  maxImageSize: number;
  orthancUrl: string;
  orthancUsername: string;
  orthancPassword: string;
}
