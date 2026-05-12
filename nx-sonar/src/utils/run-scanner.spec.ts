import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { runScanner } from './run-scanner';

jest.mock('sonarqube-scanner', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import scanner from 'sonarqube-scanner';
const scannerMock = scanner as unknown as jest.Mock;

describe('runScanner', () => {
  beforeEach(() => {
    scannerMock.mockReset();
    delete process.env.NX_SONAR_DRY_RUN;
    delete process.env.NX_SONAR_DRY_RUN_OUT;
  });

  it('calls sonarqube-scanner with the provided options', async () => {
    scannerMock.mockImplementation((_opts, cb) => cb());
    const props = { 'sonar.projectKey': 'k', 'sonar.host.url': 'https://x' };

    const result = await runScanner(props);

    expect(scannerMock).toHaveBeenCalledTimes(1);
    expect(scannerMock.mock.calls[0][0]).toMatchObject({
      serverUrl: 'https://x',
      options: props,
    });
    expect(result).toEqual({ success: true });
  });

  it('returns failure when the scanner errors', async () => {
    scannerMock.mockImplementation((_opts, cb) => cb(new Error('boom')));
    const result = await runScanner({
      'sonar.projectKey': 'k',
      'sonar.host.url': 'https://x',
    });
    expect(result.success).toBe(false);
  });

  describe('dry-run mode', () => {
    it('short-circuits the real scanner and writes the property bag to disk', async () => {
      const out = path.join(os.tmpdir(), `nx-sonar-dryrun-${Date.now()}.json`);
      process.env.NX_SONAR_DRY_RUN = '1';
      process.env.NX_SONAR_DRY_RUN_OUT = out;

      const props = {
        'sonar.projectKey': 'k',
        'sonar.host.url': 'https://x',
      };
      const result = await runScanner(props);

      expect(scannerMock).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
      expect(JSON.parse(fs.readFileSync(out, 'utf8'))).toEqual(props);

      fs.unlinkSync(out);
    });
  });
});
