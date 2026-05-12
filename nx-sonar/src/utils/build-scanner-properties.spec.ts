import { buildScannerProperties } from './build-scanner-properties';
import type { ResolvedOptions } from './types';
import type { ResolvedPaths } from './resolve-project-paths';

const baseOptions = (over: Partial<ResolvedOptions> = {}): ResolvedOptions => ({
  projectKey: 'org_my-app',
  hostUrl: 'https://sonarcloud.io',
  exclusions: ['**/node_modules/**'],
  qualityGateWait: true,
  branchDetection: true,
  extraProperties: {},
  verbose: false,
  token: 't',
  ...over,
});

const basePaths = (over: Partial<ResolvedPaths> = {}): ResolvedPaths => ({
  sources: 'apps/my-app',
  coveragePath: 'coverage/apps/my-app/lcov.info',
  ...over,
});

describe('buildScannerProperties', () => {
  it('produces the minimum required properties', () => {
    const props = buildScannerProperties({
      options: baseOptions(),
      paths: basePaths(),
      ciContext: null,
    });
    expect(props['sonar.projectKey']).toBe('org_my-app');
    expect(props['sonar.host.url']).toBe('https://sonarcloud.io');
    expect(props['sonar.sources']).toBe('apps/my-app');
    expect(props['sonar.javascript.lcov.reportPaths']).toBe(
      'coverage/apps/my-app/lcov.info',
    );
    expect(props['sonar.typescript.lcov.reportPaths']).toBe(
      'coverage/apps/my-app/lcov.info',
    );
    expect(props['sonar.qualitygate.wait']).toBe('true');
    expect(props['sonar.exclusions']).toBe('**/node_modules/**');
    expect(props['sonar.token']).toBe('t');
  });

  it('includes organization for SonarCloud', () => {
    const props = buildScannerProperties({
      options: baseOptions({ organization: 'my-org' }),
      paths: basePaths(),
      ciContext: null,
    });
    expect(props['sonar.organization']).toBe('my-org');
  });

  it('omits organization when not set (SonarQube)', () => {
    const props = buildScannerProperties({
      options: baseOptions({ hostUrl: 'https://sonar.acme.com' }),
      paths: basePaths(),
      ciContext: null,
    });
    expect('sonar.organization' in props).toBe(false);
  });

  it('maps branch CI context to sonar.branch.name', () => {
    const props = buildScannerProperties({
      options: baseOptions(),
      paths: basePaths(),
      ciContext: { kind: 'branch', name: 'develop' },
    });
    expect(props['sonar.branch.name']).toBe('develop');
  });

  it('maps PR CI context to sonar.pullrequest.* and omits branch.name', () => {
    const props = buildScannerProperties({
      options: baseOptions(),
      paths: basePaths(),
      ciContext: {
        kind: 'pullRequest',
        key: '42',
        branch: 'feat/x',
        base: 'main',
      },
    });
    expect(props['sonar.pullrequest.key']).toBe('42');
    expect(props['sonar.pullrequest.branch']).toBe('feat/x');
    expect(props['sonar.pullrequest.base']).toBe('main');
    expect('sonar.branch.name' in props).toBe(false);
  });

  it('skips branch/PR props when branchDetection=false', () => {
    const props = buildScannerProperties({
      options: baseOptions({ branchDetection: false }),
      paths: basePaths(),
      ciContext: { kind: 'branch', name: 'develop' },
    });
    expect('sonar.branch.name' in props).toBe(false);
  });

  it('lets extraProperties override built-ins', () => {
    const props = buildScannerProperties({
      options: baseOptions({
        extraProperties: { 'sonar.host.url': 'https://override' },
      }),
      paths: basePaths(),
      ciContext: null,
    });
    expect(props['sonar.host.url']).toBe('https://override');
  });

  it('sets qualitygate.wait=false when configured', () => {
    const props = buildScannerProperties({
      options: baseOptions({ qualityGateWait: false }),
      paths: basePaths(),
      ciContext: null,
    });
    expect(props['sonar.qualitygate.wait']).toBe('false');
  });

  it('includes optional fields when provided', () => {
    const props = buildScannerProperties({
      options: baseOptions({
        projectName: 'My App',
        projectVersion: '1.2.3',
      }),
      paths: basePaths({
        tests: 'apps/my-app/__tests__',
        testExecutionReportPath: 'reports/junit.xml',
      }),
      ciContext: null,
    });
    expect(props['sonar.projectName']).toBe('My App');
    expect(props['sonar.projectVersion']).toBe('1.2.3');
    expect(props['sonar.tests']).toBe('apps/my-app/__tests__');
    expect(props['sonar.testExecutionReportPaths']).toBe('reports/junit.xml');
  });
});
