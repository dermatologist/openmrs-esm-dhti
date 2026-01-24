import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { OrthancViewer } from './orthanc-viewer-core.component';
import type { Config } from '../config-schema';

/**
 * OrthancViewerWidgetProps
 * Props injected by the OpenMRS framework when the widget is rendered in a patient context
 */
interface OrthancViewerWidgetProps {
  patientUuid?: string;
}

/**
 * OrthancViewerWidget Component
 * 
 * This is the main widget component that wraps the OrthancViewer with configuration.
 * It is exported as the default component for the orthanc-viewer package.
 */
const OrthancViewerWidget: React.FC<OrthancViewerWidgetProps> = ({ patientUuid }) => {
  const config = useConfig() as Config;

  if (!patientUuid) {
    return (
      <div style={{ padding: '1rem', color: '#da1e28' }}>
        <p>Patient context not available</p>
      </div>
    );
  }

  return (
    <OrthancViewer
      patientId={patientUuid}
      orthancUrl={config.orthancUrl}
      onImageSelect={() => {}} // No-op in standalone mode
    />
  );
};

export default OrthancViewerWidget;
