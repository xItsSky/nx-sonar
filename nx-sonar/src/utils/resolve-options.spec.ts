import { resolveOptions } from './resolve-options';
import {
  MissingTokenError,
  TokenInDiskConfigError,
  InvalidConfigError,
} from './errors';
import { DEFAULT_HOST_URL, DEFAULT_EXCLUSIONS } from './types';

describe('resolveOptions', () => {
  const baseEnv = { SONAR_TOKEN: 't0k3n' };

  it('throws MissingTokenError when SONAR_TOKEN is absent', () => {
    expect(() =>
      resolveOptions({
        projectOptions: { projectKey: 'k' },
        nxJsonConfig: {},
        env: {},
      }),
    ).toThrow(MissingTokenError);
  });

  it('throws TokenInDiskConfigError when token is in projectOptions', () => {
    expect(() =>
      resolveOptions({
        projectOptions: { projectKey: 'k', token: 'leaked' } as any,
        nxJsonConfig: {},
        env: baseEnv,
      }),
    ).toThrow(TokenInDiskConfigError);
  });

  it('throws TokenInDiskConfigError when token is in nxJsonConfig', () => {
    expect(() =>
      resolveOptions({
        projectOptions: { projectKey: 'k' },
        nxJsonConfig: { token: 'leaked' } as any,
        env: baseEnv,
      }),
    ).toThrow(TokenInDiskConfigError);
  });

  it('throws InvalidConfigError when projectKey cannot be resolved', () => {
    expect(() =>
      resolveOptions({
        projectOptions: {},
        nxJsonConfig: {},
        env: baseEnv,
      }),
    ).toThrow(InvalidConfigError);
  });

  it('reads projectKey from SONAR_PROJECT_KEY env when not in options', () => {
    const resolved = resolveOptions({
      projectOptions: {},
      nxJsonConfig: {},
      env: { ...baseEnv, SONAR_PROJECT_KEY: 'env-key' },
    });
    expect(resolved.projectKey).toBe('env-key');
  });

  it('applies precedence project > nx.json > env > default for hostUrl', () => {
    expect(
      resolveOptions({
        projectOptions: { projectKey: 'k', hostUrl: 'project' },
        nxJsonConfig: { hostUrl: 'workspace' },
        env: { ...baseEnv, SONAR_HOST_URL: 'env' },
      }).hostUrl,
    ).toBe('project');

    expect(
      resolveOptions({
        projectOptions: { projectKey: 'k' },
        nxJsonConfig: { hostUrl: 'workspace' },
        env: { ...baseEnv, SONAR_HOST_URL: 'env' },
      }).hostUrl,
    ).toBe('workspace');

    expect(
      resolveOptions({
        projectOptions: { projectKey: 'k' },
        nxJsonConfig: {},
        env: { ...baseEnv, SONAR_HOST_URL: 'env' },
      }).hostUrl,
    ).toBe('env');

    expect(
      resolveOptions({
        projectOptions: { projectKey: 'k' },
        nxJsonConfig: {},
        env: baseEnv,
      }).hostUrl,
    ).toBe(DEFAULT_HOST_URL);
  });

  it('reads organization with the same precedence', () => {
    expect(
      resolveOptions({
        projectOptions: { projectKey: 'k' },
        nxJsonConfig: { organization: 'workspace-org' },
        env: { ...baseEnv, SONAR_ORGANIZATION: 'env-org' },
      }).organization,
    ).toBe('workspace-org');
  });

  it('merges exclusions: nx.json + project options + defaults, deduped', () => {
    const { exclusions } = resolveOptions({
      projectOptions: { projectKey: 'k', exclusions: ['**/*.fixture.ts'] },
      nxJsonConfig: { exclusions: ['**/legacy/**'] },
      env: baseEnv,
    });
    expect(exclusions).toEqual(
      expect.arrayContaining([
        ...DEFAULT_EXCLUSIONS,
        '**/legacy/**',
        '**/*.fixture.ts',
      ]),
    );
    expect(new Set(exclusions).size).toBe(exclusions.length);
  });

  it('merges extraProperties: nx.json then project options overwrite', () => {
    const { extraProperties } = resolveOptions({
      projectOptions: {
        projectKey: 'k',
        extraProperties: { 'sonar.foo': 'project' },
      },
      nxJsonConfig: {
        extraProperties: { 'sonar.foo': 'workspace', 'sonar.bar': 'workspace' },
      },
      env: baseEnv,
    });
    expect(extraProperties).toEqual({
      'sonar.foo': 'project',
      'sonar.bar': 'workspace',
    });
  });

  it('defaults qualityGateWait=true and branchDetection=true', () => {
    const r = resolveOptions({
      projectOptions: { projectKey: 'k' },
      nxJsonConfig: {},
      env: baseEnv,
    });
    expect(r.qualityGateWait).toBe(true);
    expect(r.branchDetection).toBe(true);
  });

  it('allows opting out of qualityGateWait per project', () => {
    const r = resolveOptions({
      projectOptions: { projectKey: 'k', qualityGateWait: false },
      nxJsonConfig: { qualityGateWait: true },
      env: baseEnv,
    });
    expect(r.qualityGateWait).toBe(false);
  });
});
