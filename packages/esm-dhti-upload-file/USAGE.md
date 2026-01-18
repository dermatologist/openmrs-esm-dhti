# Upload File Conch - Quick Start Guide

## What is this?

The upload-file conch is a microfrontend widget that allows users to upload files from a patient's chart to the DHTI backend for processing.

## Location in Patient Chart

The widget appears in the **Patient Chart Summary Tab** alongside other summary widgets like conditions, allergies, and medications.

## How to Use

1. **Open a Patient Chart**
   - Navigate to any patient in the OpenMRS system
   - The patient chart will open with the Summary tab active

2. **Find the Upload File Widget**
   - Look for the "File Upload" widget in the summary dashboard
   - It should be visible among other patient summary widgets

3. **Upload a File**
   - Click the "Choose File" button
   - Select a file from your local system
   - Click "Upload File" to send it to the backend
   - Wait for the upload to complete

4. **View Results**
   - A success notification will appear if the file was uploaded successfully
   - An error notification will appear if the upload failed
   - The notification will automatically dismiss after 5 seconds

## Configuration

The widget can be configured through the OpenMRS implementer tools:

1. Open the Implementer Tools (spanner icon in navbar)
2. Search for "upload-file" in the configuration search
3. Modify the `dhtiRoute` property to point to your DHTI service endpoint

Default configuration:
```json
{
  "@openmrs/esm-upload-file": {
    "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_upload_file/cds-services/dhti-service"
  }
}
```

## Backend Service Requirements

The DHTI `upload_file` elixir service must be running and accessible. The service should:

1. Accept POST requests with file data in JSON format:
   ```json
   {
     "fileName": "example.pdf",
     "fileType": "application/pdf",
     "fileSize": 12345,
     "fileContent": "base64-encoded-file-content"
   }
   ```

2. Return a CDS Hooks-compliant response:
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

## Development

### Running Locally

```bash
cd workspace/openmrs-esm-dhti
yarn start --sources packages/esm-dhti-upload-file
```

This will start the development server with the upload-file widget.

### Building

```bash
cd workspace/openmrs-esm-dhti/packages/esm-dhti-upload-file
yarn build
```

### Testing

```bash
cd workspace/openmrs-esm-dhti/packages/esm-dhti-upload-file
yarn test
```

## Troubleshooting

### Widget Not Visible
- Ensure you're viewing a patient chart (widget requires patient context)
- Check that the module is loaded in your OpenMRS instance
- Verify the configuration hasn't hidden the extension

### Upload Fails
- Check that the DHTI service is running at the configured endpoint
- Verify network connectivity to the backend service
- Check browser console for error messages
- Ensure the backend service can handle the file size

### File Not Uploading
- Check that a file is selected before clicking "Upload File"
- Verify the file is not too large for the browser to encode
- Check browser console for JavaScript errors

## File Format Support

The widget currently accepts all file types. The file is:
- Read as a base64-encoded data URL
- Sent to the backend as a JSON string
- Processed by the DHTI elixir service

Future versions may add:
- File type validation
- File size limits
- Supported format restrictions

## Known Limitations

1. Single file upload only (no multi-file support yet)
2. No progress indicator for large files
3. No file preview before/after upload
4. No upload history or file management

## Support

For issues or questions:
- Check the [DHTI GitHub repository](https://github.com/dermatologist/dhti)
- Review the README.md in the package directory
- Consult the implementation plan in `notes/upload-file-plan.md`
