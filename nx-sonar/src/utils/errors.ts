export class NxSonarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MissingTokenError extends NxSonarError {
  constructor() {
    super(
      'SONAR_TOKEN environment variable is not set. ' +
        'Generate a token in your Sonar server and export it before running the scan, e.g. ' +
        '`export SONAR_TOKEN=...` locally or as a secret in CI.',
    );
  }
}

export class MissingCoverageError extends NxSonarError {
  constructor(path: string) {
    super(
      `Coverage report not found at "${path}".\n` +
        'Make sure the test target emits LCOV:\n' +
        '  - jest: add "coverageReporters": ["lcov"] in jest.config.ts\n' +
        '  - vitest: add "test.coverage.reporter": ["lcov"] in vite.config.ts\n' +
        'Or pass `coverageLcovPath` in the sonar target options if your file lives elsewhere.',
    );
  }
}

export class TokenInDiskConfigError extends NxSonarError {
  constructor(source: string) {
    super(
      `A "token" was found in ${source}. ` +
        'Tokens are secrets and must not be committed. ' +
        'Remove it from ' +
        source +
        ' and provide it via the SONAR_TOKEN environment variable instead.',
    );
  }
}

export class InvalidConfigError extends NxSonarError {}
