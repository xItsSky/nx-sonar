import { execSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('nx-sonar e2e: missing SONAR_TOKEN', () => {
  const workspaceName = `nx-sonar-e2e-missing-token-${Date.now()}`;
  const workspaceRoot = join(tmpdir(), workspaceName);

  beforeAll(() => {
    mkdirSync(workspaceRoot, { recursive: true });
    execSync(
      `npx --yes create-nx-workspace@latest ${workspaceName} --preset=apps --packageManager=npm --nxCloud=skip --interactive=false`,
      { cwd: tmpdir(), stdio: 'inherit' },
    );
    execSync(`npm install --save-dev @itssky/nx-sonar@e2e`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
    });
    execSync(`npx nx g @itssky/nx-sonar:init --skipPrompts`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
    });
    execSync(`npx nx g @nx/js:library packages/sample --bundler=tsc`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
    });
    execSync(
      `npx nx g @itssky/nx-sonar:configuration --project=sample --projectKey=org_sample`,
      { cwd: workspaceRoot, stdio: 'inherit' },
    );
    const coverageDir = join(workspaceRoot, 'coverage', 'packages', 'sample');
    mkdirSync(coverageDir, { recursive: true });
    writeFileSync(join(coverageDir, 'lcov.info'), 'TN:\n');
  });

  afterAll(() => rmSync(workspaceRoot, { recursive: true, force: true }));

  it('fails fast with an actionable error', () => {
    const env = { ...process.env };
    delete env.SONAR_TOKEN;

    let output = '';
    try {
      output = execSync(`npx nx run sample:sonar --skipNxCache`, {
        cwd: workspaceRoot,
        env,
      }).toString();
    } catch (e: any) {
      output = (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '');
    }

    expect(output).toMatch(/SONAR_TOKEN/);
  });
});
