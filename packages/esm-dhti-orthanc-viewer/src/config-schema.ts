import { Type } from '@openmrs/esm-framework';

/**
 * This is the config schema for the Orthanc viewer module.
 * It defines the configuration options that can be set for this module.
 * 
 * Configuration options:
 * - orthancUrl: Base URL of the Orthanc DICOM server
 * - orthancUsername: Optional username for Orthanc authentication
 * - orthancPassword: Optional password for Orthanc authentication
 */
export const configSchema = {
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
  orthancUrl: string;
  orthancUsername: string;
  orthancPassword: string;
}
