# OpenMRS DHTI Imaging Report

## Overview

The Imaging Report widget is a GenAI-powered component that enables healthcare providers to capture medical images and receive AI-driven analysis and insights. This microfrontend integrates with the DHTI (Digital Health Transformation Initiative) backend services to provide real-time imaging analysis.

## Features

- **Screen Capture**: Capture rectangular screen areas or extract image URLs from the patient chart
- **Natural Language Queries**: Ask questions about captured images using natural language
- **AI-Powered Analysis**: Get GenAI-generated insights and analysis from the DHTI backend
- **Patient Context**: Automatically includes patient context in analysis requests
- **Real-time Responses**: Display AI-generated responses directly in the widget
- **Error Handling**: Comprehensive error handling for various failure scenarios

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
    "maxImageSize": 5242880
  }
}
```

**Configuration Options:**

- `dhtiTitle` (string): Title displayed in the widget header. Default: "Imaging Report"
- `dhtiRoute` (string): DHTI service endpoint URL for imaging analysis
- `enableScreenCapture` (boolean): Enable or disable screen capture functionality. Default: true
- `maxImageSize` (number): Maximum allowed image size in bytes. Default: 5242880 (5 MB)

### Workflow

1. **Capture Image**: Click the "Capture Image" button to activate screen capture mode
   - Left-click and drag to select a rectangular area
   - Right-click on an image to extract its URL
   - Press ESC to cancel

2. **Enter Query**: After capturing an image, a text area will appear where you can ask questions about the image
   - Example: "What abnormalities can you identify in this imaging study?"
   - Example: "Describe the key findings in this X-ray"

3. **Submit for Analysis**: Click "Submit Query" to send the image and query to the DHTI backend
   - The widget will show a loading indicator while processing
   - Patient UUID is automatically included in the request

4. **View Results**: The AI-generated analysis will be displayed below the query section
   - Results include both summary and detailed analysis (if available)
   - Errors are displayed in a distinct error section

5. **Clear**: Click "Clear" to reset the widget and start over

## Integration with DHTI Backend

The widget communicates with the DHTI backend using the `useDhti` hook from `@openmrs/esm-dhti-utils`. The request format is:

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

## Dependencies

- `@openmrs/esm-framework`: OpenMRS framework utilities
- `@openmrs/esm-dhti-utils`: DHTI utilities including ScreenCapture and useDhti hook
- `@carbon/react`: IBM Carbon Design System React components
- `@carbon/icons-react`: Carbon icons

## Troubleshooting

### Widget not appearing
- Ensure the module is properly loaded
- Check that extension slot `patient-chart-imaging-dashboard-slot` exists
- Verify module registration in import map

### Screen capture not working
- Check that `enableScreenCapture` is true
- Ensure `@openmrs/esm-dhti-utils` is properly installed
- Verify browser permissions

### DHTI service connection errors
- Verify `dhtiRoute` configuration points to the correct backend endpoint
- Check that the DHTI backend service is running and accessible
- Ensure network connectivity to the backend

## License

MPL-2.0

## Related Resources

- [OpenMRS O3 Documentation](https://o3-docs.openmrs.org/)
- [DHTI GitHub Repository](https://github.com/dermatologist/dhti)
- [ScreenCapture Component](../esm-dhti-utils/README.md#screencapture)
- [Orthanc DICOM Viewer](../esm-dhti-orthanc-viewer/README.md) (separate package)
