# @openmrs/esm-dhti-chatbot-agent

OpenMRS ESM Chatbot Agent - A conversational AI interface for patient interactions using CDS Hooks.

## Overview

This package provides a conversational interface that integrates with DHTI (Digital Health Transformation Initiative) services via CDS Hooks. It enables healthcare providers to interact with AI-powered clinical decision support in a chat-like interface.

## Features

- **Conversational UI**: Chat-based interface for natural interactions
- **CDS Hooks Integration**: Connects to CDS Hooks services for clinical decision support
- **Real-time Responses**: Displays AI-generated responses with summaries and details
- **Patient Context**: Automatically includes patient UUID in requests
- **Configurable**: Supports custom service endpoints and titles

## Configuration

Configure the module in your OpenMRS configuration:

```json
{
  "@openmrs/esm-dhti-chatbot-agent": {
    "dhtiTitle": "Healthcare Assistant",
    "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_schat/cds-services/dhti-service",
    "dhtiServiceName": "dhti_elixir_schat"
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
