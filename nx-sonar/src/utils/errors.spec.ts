import {
  MissingTokenError,
  MissingCoverageError,
  TokenInDiskConfigError,
  InvalidConfigError,
  NxSonarError,
} from './errors';

describe('errors', () => {
  describe('MissingTokenError', () => {
    it('is an NxSonarError with an actionable message', () => {
      const err = new MissingTokenError();
      expect(err).toBeInstanceOf(NxSonarError);
      expect(err.name).toBe('MissingTokenError');
      expect(err.message).toMatch(/SONAR_TOKEN/);
      expect(err.message).toMatch(/environment variable/i);
    });
  });

  describe('MissingCoverageError', () => {
    it('includes the missing path and a fix hint', () => {
      const err = new MissingCoverageError('coverage/apps/my-app/lcov.info');
      expect(err).toBeInstanceOf(NxSonarError);
      expect(err.message).toContain('coverage/apps/my-app/lcov.info');
      expect(err.message).toMatch(/lcov/i);
    });
  });

  describe('TokenInDiskConfigError', () => {
    it('explains where the token was found and how to fix it', () => {
      const err = new TokenInDiskConfigError('nx.json');
      expect(err).toBeInstanceOf(NxSonarError);
      expect(err.message).toContain('nx.json');
      expect(err.message).toMatch(/SONAR_TOKEN/);
    });
  });

  describe('InvalidConfigError', () => {
    it('wraps a custom message', () => {
      const err = new InvalidConfigError('projectKey is required');
      expect(err).toBeInstanceOf(NxSonarError);
      expect(err.message).toBe('projectKey is required');
    });
  });
});
