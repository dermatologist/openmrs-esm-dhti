module.exports = {
  transform: {
    '^.+\\.(j|t)sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs)'],
  moduleNameMapper: {
    '^@openmrs/esm-framework$': '@openmrs/esm-framework/mock',
    '\\.(s?css)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: [],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  collectCoverageFrom: [
    '**/src/**/*.ts',
    '**/src/**/*.tsx',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
};
