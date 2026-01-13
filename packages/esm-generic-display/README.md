# @openmrs/esm-dhti-display

OpenMRS ESM Generic Display Widget - AI-powered insights display for patient data.

## Overview

This package provides a generic display widget that shows AI-generated insights and analysis for patient data. It integrates with DHTI services via CDS Hooks to provide contextual clinical decision support.

## Features

- **AI-Powered Insights**: Displays AI-generated analysis and recommendations
- **Automatic Analysis**: Triggers analysis on component mount
- **Patient Context**: Automatically includes patient UUID
- **Configurable**: Supports custom service endpoints and display titles

## Configuration

Configure the module in your OpenMRS configuration:

```json
{
  "@openmrs/esm-dhti-display": {
    "dhtiTitle": "AI Analysis",
    "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_template/cds-services/dhti-service",
    "dhtiServiceName": "dhti_elixir_template"
  }
}
```

## Development

```bash
yarn install    # Install dependencies
yarn start      # Start development server
yarn test       # Run tests
yarn lint       # Run linter
```

## License

MPL-2.0
