// Dashboard day-bucketing uses local time; pin it so tests are deterministic.
process.env.TZ = 'UTC';

/** @type {import('jest').Config} */
module.exports = {
  rootDir: 'src',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  testEnvironment: 'node',
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/$1' },
  collectCoverageFrom: [
    '**/*.ts',
    '!main.ts',
    '!**/*.module.ts',
    '!**/dto/**',
    '!**/entities/**',
    '!**/*.spec.ts',
    '!test-utils/**',
  ],
  coverageDirectory: '../coverage',
};
