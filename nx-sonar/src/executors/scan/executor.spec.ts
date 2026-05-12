import executor from './executor';
import * as runner from '../../utils/run-scanner';
import type { ExecutorContext } from '@nx/devkit';

jest.mock('../../utils/run-scanner');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
}));

const runScannerMock = runner.runScanner as jest.Mock;

const context = (over: Partial<ExecutorContext> = {}): ExecutorContext =>
  ({
    root: '/ws',
    cwd: '/ws',
    isVerbose: false,
    projectName: 'my-app',
    projectsConfigurations: {
      version: 2,
      projects: {
        'my-app': { root: 'apps/my-app', name: 'my-app', targets: {} },
      },
    },
    nxJsonConfiguration: {},
    ...over,
  }) as ExecutorContext;

describe('scan executor', () => {
  const baseEnv = { SONAR_TOKEN: 't' };

  beforeEach(() => {
    runScannerMock.mockReset().mockResolvedValue({ success: true });
    Object.assign(process.env, baseEnv);
  });

  afterEach(() => {
    delete process.env.SONAR_TOKEN;
  });

  it('runs the scanner with the merged property bag on the happy path', async () => {
    const result = await executor(
      { projectKey: 'k' },
      context(),
    );
    expect(result).toEqual({ success: true });
    expect(runScannerMock).toHaveBeenCalledTimes(1);
    const props = runScannerMock.mock.calls[0][0];
    expect(props['sonar.projectKey']).toBe('k');
  });

  it('reads workspace defaults from nx.json -> nxSonar', async () => {
    await executor(
      { projectKey: 'k' },
      context({
        nxJsonConfiguration: { nxSonar: { hostUrl: 'https://workspace' } } as any,
      }),
    );
    expect(runScannerMock.mock.calls[0][0]['sonar.host.url']).toBe(
      'https://workspace',
    );
  });

  it('returns success:false and logs when SONAR_TOKEN is missing', async () => {
    delete process.env.SONAR_TOKEN;
    const err = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    const result = await executor({ projectKey: 'k' }, context());
    expect(result).toEqual({ success: false });
    expect(err).toHaveBeenCalledWith(
      expect.stringContaining('SONAR_TOKEN'),
    );
    expect(runScannerMock).not.toHaveBeenCalled();
    err.mockRestore();
  });

  it('returns success:false when the scanner fails', async () => {
    runScannerMock.mockResolvedValueOnce({ success: false });
    const result = await executor({ projectKey: 'k' }, context());
    expect(result).toEqual({ success: false });
  });
});
