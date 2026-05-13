import { execSync } from 'child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ciEnv: NodeJS.ProcessEnv = { ...process.env, CI: '1', NX_DAEMON: 'false' };

describe('nx-sonar e2e: jest project', () => {
  const workspaceName = `nx-sonar-e2e-jest-${Date.now()}`;
  const workspaceRoot = join(tmpdir(), workspaceName);

  beforeAll(() => {
    rmSync(workspaceRoot, { recursive: true, force: true });
    execSync(
      `npx --yes create-nx-workspace@latest ${workspaceName} --preset apps --packageManager npm --nxCloud skip --no-interactive`,
      { cwd: tmpdir(), stdio: 'inherit', env: ciEnv },
    );
    // Install the locally built plugin tarball (the scaffold's globalSetup
    // publishes it to a local verdaccio registry under the @e2e dist-tag).
    execSync(`npm install --save-dev @itssky/nx-sonar@e2e`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: ciEnv,
    });
  });

  afterAll(() => rmSync(workspaceRoot, { recursive: true, force: true }));

  it('init + configuration + scan dry-run produces the expected property bag', () => {
    execSync(
      `npx nx g @itssky/nx-sonar:init --hostUrl=https://sonarcloud.io --organization=my-org --skipPrompts`,
      { cwd: workspaceRoot, stdio: 'inherit', env: ciEnv },
    );

    // Create a small lib that has a jest test target.
    execSync(`npx nx g @nx/js:library packages/sample --bundler=tsc`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: ciEnv,
    });

    execSync(
      `npx nx g @itssky/nx-sonar:configuration --project=sample --projectKey=org_sample`,
      { cwd: workspaceRoot, stdio: 'inherit', env: ciEnv },
    );

    // Produce a coverage file the executor will look for.
    const coverageDir = join(workspaceRoot, 'coverage', 'packages', 'sample');
    mkdirSync(coverageDir, { recursive: true });
    writeFileSync(join(coverageDir, 'lcov.info'), 'TN:\n');

    const out = join(workspaceRoot, 'dry-run-output.json');
    execSync(`npx nx run sample:sonar --skipNxCache`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: {
        ...ciEnv,
        SONAR_TOKEN: 'e2e-token',
        NX_SONAR_DRY_RUN: '1',
        NX_SONAR_DRY_RUN_OUT: out,
      },
    });

    const props = JSON.parse(readFileSync(out, 'utf-8'));
    expect(props['sonar.projectKey']).toBe('org_sample');
    expect(props['sonar.host.url']).toBe('https://sonarcloud.io');
    expect(props['sonar.organization']).toBe('my-org');
    expect(props['sonar.token']).toBe('e2e-token');
    expect(props['sonar.javascript.lcov.reportPaths']).toContain(
      'packages/sample/lcov.info',
    );
  });
});
