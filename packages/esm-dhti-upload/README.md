# Upload File Widget

## Overview

The Upload File Widget is an OpenMRS ESM microfrontend that provides file upload functionality within the patient chart. This widget integrates with the DHTI (Digital Health Transformation Initiative) platform to process uploaded files using the `upload_file` elixir service.

## Features

- **File Selection**: Users can select files from their local system
- **Upload to Backend**: Files are uploaded to the DHTI backend service
- **Patient Context**: Automatically associates uploads with the current patient
- **Status Feedback**: Displays success or error messages after upload attempts
- **Loading States**: Shows visual feedback during the upload process

## Configuration

The widget can be configured through the OpenMRS configuration system:

```json
{
  "@openmrs/esm-dhti-upload": {
    "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_upload_file/cds-services/dhti-service"
  }
}
```

### Configuration Options

- `dhtiRoute` (string): The URL endpoint for the DHTI upload_file elixir service. Default: `http://localhost:8001/langserve/dhti_elixir_upload_file/cds-services/dhti-service`

## Usage

The widget is automatically displayed in the **patient chart summary dashboard**. It appears when viewing a patient's chart.

### User Workflow

1. Navigate to a patient's chart
2. Locate the "File Upload" widget in the summary tab
3. Click "Choose File" to select a file from your local system
4. Click "Upload File" to send the file to the backend
5. Wait for the upload to complete
6. View success or error feedback

## Technical Details

### Component Structure

- `upload-widget.component.tsx` - Main React component
- `upload-widget.scss` - Component styles
- `upload-widget.test.tsx` - Unit tests
- `config-schema.ts` - Configuration schema
- `routes.json` - Extension registration
- `index.ts` - Module entry point

### Dependencies

- `@openmrs/esm-framework` - OpenMRS frontend framework
- `esm-dhti-utils` - DHTI utility hooks and functions
- `@carbon/react` - IBM Carbon Design System components
- `react` - React library

### Extension Points

The widget is registered in the following extension slot:
- `patient-chart-summary-dashboard-slot` - Patient chart summary tab

## Development

### Building

```bash
cd workspace/openmrs-esm-dhti
yarn build
```

### Testing

```bash
cd workspace/openmrs-esm-dhti
yarn test esm-dhti-upload
```

### Local Development

```bash
cd workspace/openmrs-esm-dhti
yarn start --sources packages/esm-dhti-upload
```

## Backend Integration

The widget communicates with the DHTI `upload_file` elixir service. The service expects:

### Request Format

```json
{
  "fileName": "example.pdf",
  "fileType": "application/pdf",
  "fileSize": 12345,
  "fileContent": "base64-encoded-content"
}
```

### Response Format

The service should return a CDS Hooks-compliant response:

```json
{
  "cards": [
    {
      "summary": "File uploaded successfully!",
      "indicator": "info",
      "source": {
        "label": "DHTI Upload Service"
      }
    }
  ]
}
```

## Troubleshooting

### Upload Fails

- Verify the DHTI service is running
- Check the `dhtiRoute` configuration is correct
- Ensure the backend service is accessible from the frontend
- Check browser console for error messages

### Widget Not Visible

- Verify the widget is enabled in the OpenMRS configuration
- Check that you're viewing a patient chart (the widget requires patient context)
- Ensure the module is properly built and loaded

## License

MIT
