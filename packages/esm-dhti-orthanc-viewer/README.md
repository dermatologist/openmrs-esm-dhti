# OpenMRS DHTI Orthanc Viewer

## Overview

The Orthanc Viewer is a standalone OpenMRS microfrontend for viewing and managing medical images stored in Orthanc DICOM servers.

## Features

- View DICOM images for specific patients
- Upload local PNG images to the Orthanc server
- Navigate through patient image collections
- Display DICOM metadata

## Installation

```bash
yarn install
cd packages/esm-dhti-orthanc-viewer
yarn build
```

## Configuration

```json
{
  "@openmrs/esm-dhti-orthanc-viewer": {
    "orthancUrl": "http://localhost:8010/http://orthanc:8042",
    "orthancUsername": "",
    "orthancPassword": ""
  }
}
```

## License

MPL-2.0
