# OpenMRS DHTI Imaging Report

## Overview

The Imaging Report widget is a GenAI-powered component that enables healthcare providers to capture, view, and analyze medical images with AI-driven insights. This microfrontend integrates with:
- **DHTI Backend Services**: For GenAI-powered image analysis
- **Orthanc DICOM Server**: For medical image storage and retrieval

## Features

### Image Acquisition
- **Screen Capture**: Capture rectangular screen areas or extract image URLs from the patient chart
- **DICOM Viewer**: View and upload medical images from an Orthanc DICOM server
- **Local Upload**: Upload local PNG images with DICOM metadata

### AI Analysis
- **Natural Language Queries**: Ask questions about images using natural language
- **AI-Powered Analysis**: Get GenAI-generated insights and analysis from the DHTI backend
- **Patient Context**: Automatically includes patient context in analysis requests
- **Real-time Responses**: Display AI-generated responses directly in the widget

### DICOM Integration
- **Image Storage**: Upload PNG images as DICOM files to Orthanc server
- **Image Retrieval**: Fetch and view all images for a specific patient
- **Navigation**: Browse through patient images with previous/next controls
- **Metadata**: View DICOM tags (Patient Name, Study Description, Date)

## Installation

This module is part of the openmrs-esm-dhti monorepo.

```bash
# Install dependencies
yarn install

# Build the module
cd packages/esm-dhti-imaging-report
yarn build
```

## Usage

The Imaging Report widget is displayed in the patient chart's imaging dashboard slot.

### Configuration

```json
{
  "@openmrs/esm-imaging-report": {
    "dhtiTitle": "Imaging Report",
    "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_imaging_report/cds-services/dhti-service",
    "enableScreenCapture": true,
    "maxImageSize": 5242880,
    "orthancUrl": "http://localhost:8010/http://orthanc:8042",
    "orthancUsername": "",
    "orthancPassword": ""
  }
}
```

**Configuration Options:**

- `dhtiTitle` (string): Title displayed in the widget header. Default: "Imaging Report"
- `dhtiRoute` (string): DHTI service endpoint URL for imaging analysis
- `enableScreenCapture` (boolean): Enable or disable screen capture functionality. Default: true
- `maxImageSize` (number): Maximum allowed image size in bytes. Default: 5242880 (5 MB)
- `orthancUrl` (string): Base URL of the Orthanc DICOM server. Default: "http://localhost:8010/http://orthanc:8042"
- `orthancUsername` (string): Optional username for Orthanc authentication
- `orthancPassword` (string): Optional password for Orthanc authentication

### Workflow

#### Screen Capture Method

1. Click the **"Screen Capture"** tab
2. Click **"Capture Image"** button to activate screen capture mode
   - Left-click and drag to select a rectangular area
   - Right-click on an image to extract its URL
   - Press ESC to cancel
3. Enter your query in the text area
4. Click **"Submit Query"** to analyze with AI
5. View results below

#### DICOM Viewer Method

1. Click the **"DICOM Viewer"** tab
2. **View Existing Images**:
   - Widget automatically loads latest image for the patient
   - Use arrow buttons to navigate through images
   - View DICOM metadata (Patient Name, Study, Date)
3. **Upload New Image**:
   - Click **"Open Image File"** to select a local PNG
   - Enter **Patient Name** (required)
   - Enter **Study Description** (optional)
   - Click **"Upload to Orthanc"** to save
4. **Analyze with AI**:
   - Selected image is automatically available for analysis
   - Enter your query in the text area
   - Click **"Submit Query"**
5. View AI-generated analysis results

## Orthanc DICOM Server Setup

### Prerequisites

1. **Install Orthanc**:
```bash
# Docker
docker run -p 8042:8042 jodogne/orthanc

# Or install from https://www.orthanc-server.com/download.php
```

2. **Configure Orthanc** (optional):
```json
{
  "Name": "OpenMRS DHTI",
  "RemoteAccessAllowed": true,
  "AuthenticationEnabled": false
}
```

### REST API Endpoints Used

The widget integrates with the following Orthanc REST API endpoints:

- **`POST /tools/create-dicom`**: Upload PNG images as DICOM files
- **`POST /tools/find`**: Search for patient images
- **`GET /instances/{id}/preview`**: Fetch image preview
- **`GET /instances/{id}`**: Fetch instance details

### How It Works

1. **Image Upload**:
   - Converts PNG to DICOM format with metadata
   - Stores in Orthanc with Patient ID, Name, and Study Description
   - Returns instance ID for reference

2. **Image Retrieval**:
   - Searches Orthanc by Patient ID
   - Fetches all instances for the patient
   - Loads preview images and metadata

3. **Image Display**:
   - Renders images on HTML5 canvas
   - Provides navigation controls
   - Displays DICOM metadata

## Integration with DHTI Backend

The widget communicates with the DHTI backend using the `useDhti` hook. The request format is:

```typescript
{
  context: {
    input: JSON.stringify({
      image_url: string,  // Base64 PNG or URL
      text: string        // User's query
    }),
    patientId: string     // Patient UUID
  }
}
```

The backend should return a CDS Hooks card with:
- `summary`: Brief analysis result (required)
- `detail`: Detailed analysis (optional)

## Components

### OrthancViewer

Reusable component for viewing and uploading DICOM images.

```typescript
import { OrthancViewer } from './orthanc-viewer.component';

<OrthancViewer
  patientId="patient-123"
  orthancUrl="http://localhost:8010/http://orthanc:8042"
  onImageSelect={(imageUrl) => console.log('Selected:', imageUrl)}
/>
```

**Props:**
- `patientId`: Patient identifier for fetching images
- `orthancUrl`: Orthanc server base URL
- `onImageSelect`: Callback when an image is selected

## Dependencies

- `@openmrs/esm-framework`: OpenMRS framework utilities
- `@openmrs/esm-dhti-utils`: DHTI utilities including:
  - ScreenCapture component
  - useDhti hook
  - useOrthanc hook
- `@carbon/react`: IBM Carbon Design System React components
- `@carbon/icons-react`: Carbon icons
- `axios`: HTTP client for Orthanc API (via esm-dhti-utils)

## Development

### Project Structure

```
src/
├── imaging-report/
│   ├── imaging-report.component.tsx     # Main widget component
│   ├── imaging-report.test.tsx          # Widget tests
│   ├── imaging-report.scss              # Widget styles
│   ├── orthanc-viewer.component.tsx     # DICOM viewer component
│   ├── orthanc-viewer.test.tsx          # Viewer tests
│   └── orthanc-viewer.scss              # Viewer styles
├── config-schema.ts                     # Configuration schema
├── index.ts                             # Module entry point
└── routes.json                          # Extension definitions
```

### Testing

```bash
yarn test
```

The module includes comprehensive unit tests:
- Widget component tests
- OrthancViewer component tests (18 test cases)
- Integration tests

### Building

```bash
yarn build
```

### Linting

```bash
yarn lint
yarn typescript
```

## Troubleshooting

### Widget not appearing
- Ensure the module is properly loaded
- Check that extension slot `patient-chart-imaging-dashboard-slot` exists
- Verify module registration in import map

### Orthanc connection errors
- Verify `orthancUrl` configuration
- Ensure Orthanc server is running and accessible
- Check network connectivity
- If authentication is enabled, provide username/password in config

### Image upload fails
- Check file format (must be PNG)
- Verify Patient Name is provided
- Check Orthanc server logs for errors
- Ensure Orthanc has write permissions

### No images found for patient
- Verify patient ID matches Orthanc records
- Check that images were uploaded with correct Patient ID
- Use Orthanc Explorer (http://localhost:8010/http://orthanc:8042/app/explorer.html) to verify

### Screen capture not working
- Check that `enableScreenCapture` is true
- Ensure `@openmrs/esm-dhti-utils` is properly installed
- Verify browser permissions

## License

MPL-2.0

## Contributing

Contributions are welcome! Please follow the OpenMRS contribution guidelines.

## Support

For issues or questions:
- GitHub Issues: https://github.com/dermatologist/openmrs-esm-dhti/issues
- OpenMRS Community: https://openmrs.org/community/

## Related Resources

- [OpenMRS O3 Documentation](https://o3-docs.openmrs.org/)
- [DHTI GitHub Repository](https://github.com/dermatologist/dhti)
- [Orthanc Documentation](https://www.orthanc-server.com/static.php?page=documentation)
- [ScreenCapture Component](../esm-dhti-utils/README.md#screencapture)
- [useOrthanc Hook](../esm-dhti-utils/README.md#useorthanc)
