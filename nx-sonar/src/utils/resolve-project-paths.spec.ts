import { resolveProjectPaths } from './resolve-project-paths';
import { MissingCoverageError } from './errors';
import * as fs from 'fs';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
}));

const existsSyncMock = fs.existsSync as unknown as jest.Mock;

describe('resolveProjectPaths', () => {
  beforeEach(() => existsSyncMock.mockReset());

  const input = (overrides: Partial<Parameters<typeof resolveProjectPaths>[0]> = {}) => ({
    workspaceRoot: '/ws',
    projectRoot: 'apps/my-app',
    options: {},
    ...overrides,
  });

  it('returns project root as sources by default', () => {
    existsSyncMock.mockReturnValue(true);
    expect(resolveProjectPaths(input()).sources).toBe('apps/my-app');
  });

  it('uses the default coverage path when options.coverageLcovPath is not set', () => {
    existsSyncMock.mockReturnValue(true);
    expect(resolveProjectPaths(input()).coveragePath).toBe(
      'coverage/apps/my-app/lcov.info',
    );
  });

  it('honours an override coverage path', () => {
    existsSyncMock.mockReturnValue(true);
    expect(
      resolveProjectPaths(
        input({ options: { coverageLcovPath: 'custom/lcov.info' } }),
      ).coveragePath,
    ).toBe('custom/lcov.info');
  });

  it('throws MissingCoverageError when the coverage file does not exist', () => {
    existsSyncMock.mockImplementation(
      (p: string) => !p.endsWith('lcov.info'),
    );
    expect(() => resolveProjectPaths(input())).toThrow(MissingCoverageError);
  });

  it('warns and omits testExecutionReportPath when the configured file does not exist', () => {
    existsSyncMock.mockImplementation(
      (p: string) => p.endsWith('lcov.info'),
    );
    const warn = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    const result = resolveProjectPaths(
      input({
        options: { testExecutionReportPath: 'reports/junit.xml' },
      }),
    );
    expect(result.testExecutionReportPath).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('reports/junit.xml'),
    );
    warn.mockRestore();
  });

  it('returns testExecutionReportPath when the file exists', () => {
    existsSyncMock.mockReturnValue(true);
    expect(
      resolveProjectPaths(
        input({ options: { testExecutionReportPath: 'reports/junit.xml' } }),
      ).testExecutionReportPath,
    ).toBe('reports/junit.xml');
  });
});
