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

## License

MPL-2.0
