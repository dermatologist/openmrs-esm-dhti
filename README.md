# OpenMRS ESM [DHTI](https://github.com/dermatologist/dhti)

<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/dhti-logo.jpg" />
</p>

- 🚀 *Healing begins with a single, sacred vibration!*

## About

This is a monorepo for [DHTI](https://github.com/dermatologist/dhti) conches (OpenMRS ESM microfrontends) for communicating with [DHTI](https://github.com/dermatologist/dhti) elixirs (Langserve apps for healthcare), providing context and displaying results within [OpenMRS EMR](https://openmrs.org/). *However, [DHTI](https://github.com/dermatologist/dhti) elixirs can be tested with any FHIR and CDS Hooks compatible EHR system.*

[DHTI](https://github.com/dermatologist/dhti) provides command-line tools (`dhti-cli`) for installation and management of DHTI elixirs and conches using docker containers. [DHTI](https://github.com/dermatologist/dhti) [Vidhis](https://github.com/dermatologist/dhti/blob/develop/vidhi/README.md) (receipes) provides a set of shell commands that you can used to easily spin up a complete DHTI environment with elixirs and conches supporting modules such as the *Chatbot Agent (with patient chart context), RAG, Imaging Report widget, Orthanc DICOM viewer,* and more. Additionally, there is a browser extension that allows you to capture webpage content and send it to the DHTI elixir.

**The best way to start using these microfrontends is by following the [DHTI Vidhis](https://github.com/dermatologist/dhti/blob/develop/vidhi/README.md).** Also see the [![Wiki](https://img.shields.io/badge/DHTI-wiki-demo)](https://github.com/dermatologist/dhti/wiki). Individual packages also have their own README files with more details.

## Starting with dhti (Example)

```bash
npx dhti-cli conch install
npx dhti-cli conch start -s packages/esm-chatbot-agent -n esm-chatbot-agent

```

## Available Packages

This monorepo contains the following packages:

### Frontend Modules

- **[esm-chatbot-agent](packages/esm-chatbot-agent/README.md)** - Conversational AI interface for patient interactions
- **[esm-generic-display](packages/esm-generic-display/README.md)** - Generic display widget for AI-powered insights
- **[esm-starter-app](packages/esm-starter-app/README.md)** - Template application demonstrating OpenMRS ESM best practices
- **[esm-dhti-upload](packages/esm-dhti-upload/README.md)** - Module for uploading files for RAG.
- **[esm-dhti-imaging-report](packages/esm-dhti-imaging-report/README.md)** - GenAI-powered imaging report widget.
- **[esm-dhti-orthanc-viewer](packages/esm-dhti-orthanc-viewer/README.md)** - Orthanc DICOM viewer integration (Dermatology/Pathology workflows in combination with imaging-report).

### Utilities

- ✨ **[dhti-screen-grabber](packages/dhti-screen-grabber/README.md)** - Browser extension to capture webpage content and send to DHTI server

### Shared Libraries

- **[esm-dhti-utils](packages/esm-dhti-utils/README.md)** - Shared utilities, hooks, and models used across DHTI packages

## Architecture

The monorepo is structured to reduce code duplication and promote code reuse:

```
openmrs-esm-dhti/
├── packages/
│   ├── esm-chatbot-agent/         # Conversational AI interface
│   ├── esm-generic-display/       # AI-powered display widget
│   ├── esm-starter-app/           # Template/example app
│   ├── esm-dhti-utils/            # Shared utilities (hooks, models)
│   │   ├── hooks/                 # Reusable React hooks
│   │   │   ├── usePatient.ts      # Patient search hook
│   │   │   └── useDhti.ts         # DHTI service integration hook
│   │   └── models/                # TypeScript models
│   │       ├── card.ts            # CDS Hooks Card model
│   │       └── request.ts         # CDS Hooks Request model
│   ├── esm-dhti-upload/           # File upload for RAG
│   ├── esm-dhti-imaging-report/   # GenAI imaging report widget
│   └── esm-dhti-orthanc-viewer/   # Orthanc DICOM viewer integration
│
├── dhti-screen-grabber/           # Browser extension for screen capture
│   ├── background.js
│   ├── content.js
│   ├── manifest.json
│   └── ...
└── ...
```

### Shared Utilities

The `esm-dhti-utils` package provides:
- **usePatient**: React hook for searching patients via FHIR API (by name or identifier)
- **useDhti**: React hook for integrating with DHTI CDS Hooks services (AI/decision support)
- **CDSHookCard**: TypeScript model for CDS Hooks response cards
- **CDSHookRequest**: TypeScript model for CDS Hooks request payloads
- **ScreenCapture**: Utility for capturing images for VLMs.
- **useOrthanc**: React hook for interacting with Orthanc DICOM server.

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## Configuring in OpenMRS

REF: https://o3-docs.openmrs.org/docs/configure-o3/overview

You can make changes to frontend module configurations through the built-in implementer tools panel. Once you log into OpenMRS, clicking on the wrench  icon 🔧  in the top right navbar. Then you can click on the "Configuration tab" and add JSON as below. To make permanent changes to the configuration, you will need to commit those changes to your module configuration. The implementer tools allow you to download a temporary config file containing your changes by clicking the Download config button. The standard easy approach to configuration overrides to frontend modules is to create a JSON configuration that you can paste into the json editor of the implementers tools. For example:

```json
{
  "@openmrs/esm-starter-app": {
    "exampleSetting": "exampleValue"
  }
}
```

## [Generic Instructions for OpenMRS ESM modules](/notes/setup.md)

## Contributing

Please see the [Contributing Guide](CONTRIBUTING.md) for information about contributing to this project. WIP

## Contributors

* [Bell Eapen](https://nuchange.ca) ([UIS](https://www.uis.edu/directory/bell-punneliparambil-eapen)) |  [Contact](https://nuchange.ca/contact) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)