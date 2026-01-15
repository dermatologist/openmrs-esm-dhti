# AGENTS.md - Guide for AI Coding Agents

## Repository Overview

This is the **openmrs-esm-dhti** monorepo, a collection of OpenMRS 3.0 (O3) microfrontends built for DHTI (Digital Health Transformation Initiative). The repository follows OpenMRS ESM (Enterprise Service Module) conventions and uses a modern monorepo structure.

## Quick Start

```bash
# Install dependencies
corepack enable
yarn install

# Run tests
yarn turbo run test

# Run linter
yarn turbo run lint

# Build all packages
yarn turbo run build

# Start development server for a specific package
yarn start --sources 'packages/esm-chatbot-agent'
```

## Repository Structure

```
openmrs-esm-dhti/
├── packages/
│   ├── esm-chatbot-agent/      # Conversational AI interface
│   ├── esm-generic-display/    # AI-powered display widget
│   ├── esm-starter-app/        # Template/example app
│   └── esm-dhti-utils/         # Shared utilities (hooks, models)
├── e2e/                        # End-to-end tests
├── notes/                      # Documentation and notes
├── turbo.json                  # Turborepo configuration
├── package.json                # Root package configuration
└── yarn.lock                   # Dependency lockfile
```

## Package Architecture

### Frontend Modules

1. **esm-chatbot-agent**: Provides a conversational interface using CDS Hooks
   - Main component: `ConversationComponent`
   - Uses `useDhti` hook for AI interactions

2. **esm-generic-display**: Displays AI-generated insights for patient data
   - Main component: `DisplayWidget`
   - Uses `useDhti` hook for analysis

3. **esm-starter-app**: Reference implementation and examples
   - Demonstrates best practices
   - Shows patient search using `usePatient` hook

### Shared Library

4. **esm-dhti-utils**: Central location for shared code
   - **Hooks**:
     - `usePatient`: Patient search via FHIR API
     - `useDhti`: CDS Hooks service integration
   - **Models**:
     - `CDSHookCard`: Response card model
     - `CDSHookRequest`: Request model

## Key Technologies

- **Language**: TypeScript
- **Framework**: React 18
- **Testing**: Jest + React Testing Library
- **Build Tool**: Webpack 5
- **Package Manager**: Yarn 4 (with workspaces)
- **Monorepo Tool**: Turborepo 2
- **Linting**: ESLint + Prettier
- **OpenMRS**: ESM Framework (next)

## Important Conventions

### Code Style

1. **Follow esm-starter-app style**: This package provides the canonical style guide
2. **Use TypeScript**: All new code should be strongly typed
3. **Prefer functional components**: Use hooks instead of class components
4. **Use ESM imports**: Use ES6 module syntax

### Testing

1. **Write tests for new code**: All new functionality should have unit tests
2. **Mock external dependencies**: Use Jest mocks for external modules
3. **Test user interactions**: Use React Testing Library's user-event
4. **Aim for high coverage**: Target >80% code coverage

### Naming Conventions

- **Components**: PascalCase (e.g., `ConversationComponent.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePatient.ts`)
- **Models**: PascalCase (e.g., `CDSHookCard.ts`)
- **Test files**: Same name as source with `.test.ts(x)` suffix

## Working with the Monorepo

### Adding Dependencies

```bash
# Add to specific package
cd packages/esm-chatbot-agent
yarn add <package-name>

# Add to workspace root (dev dependencies)
yarn add -D -W <package-name>
```

### Using Shared Utilities

All packages should use `@openmrs/esm-dhti-utils` for common functionality:

```typescript
import { usePatient, useDhti, CDSHookCard } from '@openmrs/esm-dhti-utils';
```

### Running Commands

```bash
# Run command in all packages
yarn turbo run <script>

# Run in specific package
yarn turbo run <script> --filter=@openmrs/esm-chatbot-agent

# Force re-run (bypass cache)
yarn turbo run test --force
```

## Configuration System

OpenMRS uses a centralized configuration system. Each package has a `config-schema.ts`:

```typescript
export const configSchema = {
  dhtiTitle: {
    _type: Type.String,
    _default: 'Default Title',
    _description: 'Title for the widget',
  },
  dhtiRoute: {
    _type: Type.String,
    _default: 'http://localhost:8001/service',
    _description: 'Service endpoint URL',
  },
};
```

Access config in components:
```typescript
const config = useConfig();
const title = config.dhtiTitle;
```

## CDS Hooks Integration

This repo integrates with CDS Hooks services for clinical decision support:

### Request Format
```typescript
const request = new CDSHookRequest({
  hook: 'patient-view',
  context: {
    patientId: 'patient-123',
    input: 'User message'
  },
});
```

### Response Format
```typescript
interface CDSHookCard {
  summary: string;           // Required
  detail?: string;           // Optional details
  indicator?: 'info' | 'warning' | 'hard-stop';
  source?: CDSHookCardSource;
  links?: CDSHookCardLink[];
}
```

## FHIR Patient Search

The `usePatient` hook searches via FHIR API:

```typescript
const { patient, error, isLoading } = usePatient('John Doe');
// or
const { patient, error, isLoading } = usePatient('123456'); // ID search
```

## Common Tasks for AI Agents

### 1. Adding a New Feature

1. Determine if code should be shared or package-specific
2. If shared, add to `esm-dhti-utils`
3. Write unit tests first (TDD approach)
4. Implement the feature
5. Update documentation
6. Run linter and tests

### 2. Fixing a Bug

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Check for similar bugs in other packages
5. Update shared utilities if the fix applies broadly

### 3. Refactoring Code

1. Identify duplicate code across packages
2. Extract to `esm-dhti-utils` with tests
3. Update packages to use shared code
4. Remove old duplicate code
5. Verify all tests pass

### 4. Adding Tests

1. Use Jest and React Testing Library
2. Mock external dependencies (`@openmrs/esm-framework`, `axios`, etc.)
3. Test user interactions, not implementation details
4. Aim for high coverage of new code

## Debugging Tips

### Tests Failing

```bash
# Run tests in watch mode
yarn turbo run test:watch --filter=<package>

# Run specific test file
yarn turbo run test -- <filename>

# View full error output
yarn turbo run test --force
```

### Build Issues

```bash
# Clean and rebuild
rm -rf node_modules packages/*/node_modules
yarn install
yarn turbo run build --force
```

### Import Errors

- Verify `esm-dhti-utils` is in dependencies
- Check exports in `esm-dhti-utils/src/index.ts`
- Run `yarn install` after adding dependencies

## Important Files

- `turbo.json`: Build pipeline configuration
- `tsconfig.json`: TypeScript configuration (root)
- `jest.config.js`: Jest configuration (per package)
- `webpack.config.js`: Webpack configuration (per package)
- `.eslintrc`: ESLint rules (root)

## OpenMRS ESM Framework

This repo uses the OpenMRS ESM Framework for:
- `useConfig()`: Access configuration
- `openmrsFetch()`: Make authenticated API calls
- `fhirBaseUrl`: FHIR endpoint base URL
- `usePatientUuid()`: Get current patient UUID

See [ESM Framework docs](https://openmrs.github.io/openmrs-esm-core/) for more.

## Best Practices

1. **Don't repeat code**: Extract to `esm-dhti-utils` if used in multiple packages
2. **Write tests**: Every feature should have tests
3. **Document well**: Add JSDoc comments for public APIs
4. **Keep it simple**: Follow existing patterns in `esm-starter-app`
5. **Use types**: Leverage TypeScript for type safety
6. **Follow conventions**: Match the style of existing code
7. **Test imports**: Verify shared utilities work correctly

## Links and Resources

- [OpenMRS O3 Docs](https://o3-docs.openmrs.org/)
- [ESM Framework](https://openmrs.github.io/openmrs-esm-core/)
- [CDS Hooks](https://cds-hooks.org/)
- [FHIR](https://www.hl7.org/fhir/)
- [React Testing Library](https://testing-library.com/react)
- [Turborepo](https://turborepo.com/)

## Contact

For questions about this repository:
- Check the OpenMRS developer forum
- Review OpenMRS documentation
- Refer to notes/ directory for additional context

## Version Information

- Node: 18+
- Yarn: 4.10.3+
- TypeScript: 5.0+
- React: 18.x

---

**Last Updated**: 2026-01-13

This guide is for AI coding agents and developers working on the openmrs-esm-dhti repository.
