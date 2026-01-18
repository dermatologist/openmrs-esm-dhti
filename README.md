# OpenMRS ESM [DHTI](https://github.com/dermatologist/dhti)

<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/dhti-logo.jpg" />
</p>

- 🚀 *Healing begins with a single, sacred vibration!*

This repository contains a collection of microfrontends built using the OpenMRS ESM framework for [DHTI](https://github.com/dermatologist/dhti)

## Starting with dhti (Example)

```bash
dhti-cli conch install -g dermatologist/openmrs-esm-dhti -s packages/esm-chatbot-agent -n esm-chatbot-agent
dhti-cli conch start -g dermatologist/openmrs-esm-dhti -s packages/esm-chatbot-agent -n esm-chatbot-agent

```

## Setup

Check out the developer documentation [in the Wiki](https://openmrs.atlassian.net/wiki/x/IABBHg).

This monorepo uses [yarn](https://yarnpkg.com).

To install the dependencies, run:

```bash
corepack enable
yarn
```

To start a dev server for a specific microfrontend, run (example):

```bash
yarn start --sources 'packages/esm-chatbot-agent'
```

## Available Packages

This monorepo contains the following packages:

### Frontend Modules

- **[esm-chatbot-agent](packages/esm-chatbot-agent/README.md)** - Conversational AI interface for patient interactions
- **[esm-generic-display](packages/esm-generic-display/README.md)** - Generic display widget for AI-powered insights
- **[esm-starter-app](packages/esm-starter-app/README.md)** - Template application demonstrating OpenMRS ESM best practices
_ **[esm-dhti-upload](packages/esm-dhti-upload/README.md)** - Module for uploading files for RAG.

### Shared Libraries

- **[esm-dhti-utils](packages/esm-dhti-utils/README.md)** - Shared utilities, hooks, and models used across DHTI packages

## Architecture

The monorepo is structured to reduce code duplication and promote code reuse:

```
openmrs-esm-dhti/
├── packages/
│   ├── esm-chatbot-agent/      # Conversational AI module
│   ├── esm-generic-display/    # Display widget module
│   ├── esm-starter-app/        # Template/starter module
│   └── esm-dhti-utils/         # Shared utilities (NEW)
│       ├── hooks/              # Reusable React hooks
│       │   ├── usePatient.ts   # Patient search hook
│       │   └── useDhti.ts      # DHTI service integration hook
│       └── models/             # TypeScript models
│           ├── card.ts         # CDS Hooks Card model
│           └── request.ts      # CDS Hooks Request model
└── ...
```

### Shared Utilities

The `esm-dhti-utils` package provides:
- **usePatient**: Hook for searching patients via FHIR API (supports name and identifier search)
- **useDhti**: Hook for interacting with DHTI CDS Hooks services
- **CDSHookCard/CDSHookRequest**: TypeScript models for CDS Hooks integration

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## Configuring in OpenMRS

REF: https://o3-docs.openmrs.org/docs/configure-o3/overview

Implementers can make changes to frontend module configurations through the built-in implementer tools panel. Once you log into O3, clicking the caret arrow centered at the bottom of the screen will pull up the implementer tools. Alternatively, you can click on the cog icon in the navbar. Once open, you can look up configuration properties by searching through the configuration and modify them on the fly. Note that any tweaks made to the configuration through the implementer tools will be lost once you refresh the page. To make permanent changes to the configuration, you will need to commit those changes to your distro's configuration. The implementer tools allow you to download a temporary config file containing your changes by clicking the Download config button.

Typically, you'll need to make multiple configuration overrides to various frontend modules. The standard approach is to create a JSON configuration file that is accessible via HTTP/HTTPS on your server. You can then point your SPA to this configuration file by specifying its URL in the configUrls array of the SPA build configuration file (spa-build-config.json). Alternatively, you can include frontend configuration in content packages (see "Content package frontend configuration" below).



## Starting a dev server

This command uses the [openmrs](https://www.npmjs.com/package/openmrs) tooling to fire up a dev server running `esm-patient-chart` as well as the specified microfrontend.

There are two approaches for working on multiple microfrontends simultaneously.

You could run `yarn start` with as many `sources` arguments as you require. For example, to run the biometrics and vitals microfrontends simultaneously, you'd use:

```bash
yarn start --sources 'packages/esm-patient-biometrics-app' --sources 'packages/esm-patient-vitals-app'
```

Alternatively, you could run `yarn serve` from within the individual packages and then use [import map overrides](https://openmrs.atlassian.net/wiki/spaces/docs/pages/150962685/Develop+Frontend+Modules#Using-import-map-overrides).

## Running unit and integration tests

To run unit and integration tests for all packages, run:

```bash
yarn turbo run test
```

To run tests in `watch` mode, run:

```bash
yarn turbo run test:watch
```

To run tests for a specific package, pass the package name to the `--filter` flag. For example, to run tests for `esm-patient-conditions-app`, run:

```bash
yarn turbo run test --filter=@openmrs/esm-patient-conditions-app
```

To run a specific test file, run:

```bash
yarn turbo run test -- visit-notes-form
```

The above command will only run tests in the file or files that match the provided string.

You can also run the matching tests from above in watch mode. In order to interact with the test runner, you will need to tell Turborepo to use the "tui" UI. Use the following command
and then press "enter" in the Turbo UI to activate interactive mode.

```bash
yarn turbo run test:watch --ui tui -- visit-notes-form
```

To generate a `coverage` report, run:

```bash
yarn turbo run coverage
```

By default, `turbo` will cache test runs. This means that re-running tests wihout changing any of the related files will return the cached logs from the last run. To bypass the cache, run tests with the `force` flag, as follows:

```bash
yarn turbo run test --force
```

## Running End-to-End (E2E) tests

Before running the E2E tests, you need to set up the test environment. Install Playwright browsers and setup the default test environment variables by running the following commands:

```bash
npx playwright install
cp example.env .env
```

By default, tests run against a local backend at http://localhost:8080/openmrs. To test local changes, make sure your dev server is running before executing tests. For example, to test local changes to the Allergies app, run:

```bash
yarn start --sources packages/esm-patient-allergies-app
```

To test against a remote instance (such as the OpenMRS refapp hosted on dev3.openmrs.org, update the E2E_BASE_URL environment variable in your .env file:

```
E2E_BASE_URL=https://dev3.openmrs.org/openmrs
```

To run E2E tests:

```bash
yarn test-e2e
```

This will run all the E2E tests (files in the e2e directory with the *.spec.ts extension) in headless mode. That means no browser UI will be visible.

To run tests in headed mode (shows the browser while tests run) use:

```bash
yarn test-e2e --headed
```

To run tests in Playwright's UI mode (interactive debugger), use:

```bash
yarn test-e2e --ui
```

You'll most often want to run tests in both headed and UI mode:

```bash
yarn test-e2e --headed --ui
```

To run a specific test file:

```bash
yarn test-e2e <test-name>
```

Read the [e2e testing guide](https://openmrs.atlassian.net/wiki/x/K4L-C) to learn more about End-to-End tests in this project.

### Updating Playwright

The Playwright version in the [Bamboo e2e Dockerfile](e2e/support/bamboo/playwright.Dockerfile#L2) and the `package.json` file must match. If you update the Playwright version in one place, you must update it in the other.

## Troubleshooting

If you notice that your local version of the application is not working or that there's a mismatch between what you see locally versus what's in [dev3](https://dev3.openmrs.org/openmrs/spa), you likely have outdated versions of core libraries. To update core libraries, run the following commands:

```bash
# Upgrade core libraries
yarn up openmrs@next @openmrs/esm-framework@next

# Reset version specifiers to `next`. Don't commit actual version numbers.
git checkout package.json

# Run `yarn` to recreate the lockfile
yarn
```

## Layout

The patient chart consists of the following parts:

- Navigation menu
- Patient header
- Chart review / Dashboards
- Workspace
- Side menu

The **navigation menu** lives on the left side of the screen and provides links to dashboards in the patient chart.

The **patient header** contains the [patient banner](packages/esm-patient-banner-app/README.md). Uninvasive notifications also appear in this area following actions such as form submissions.

The **chart review** area is the main part of the screen. It displays whatever dashboard is active.

A **dashboard** is a collection of widgets.

The **workspace** is where data entry takes place. On mobile devices it covers the screen; on desktop it appears in a sidebar.

The **side menu** provides access to features that do not have their own pages, such as the notifications menu.

## Design Patterns

For documentation about our design patterns, please visit our [design system](https://zeroheight.com/23a080e38/p/880723--introduction) documentation website.

## Configuration

Please see the [Implementer Documentation](https://wiki.openmrs.org/pages/viewpage.action?pageId=224527013) for information about configuring modules.

## Deployment

See [Creating a Distribution](https://openmrs.atlassian.net/wiki/x/xoIBCQ) for information about adding microfrontends to a distribution.

## Contributing

Please see the [Contributing Guide](CONTRIBUTING.md) for information about contributing to this project. WIP

## Contributors

* [Bell Eapen](https://nuchange.ca) ([UIS](https://www.uis.edu/directory/bell-punneliparambil-eapen)) |  [Contact](https://nuchange.ca/contact) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)