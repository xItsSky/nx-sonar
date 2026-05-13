import { execSync } from 'child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ciEnv: NodeJS.ProcessEnv = { ...process.env, CI: '1', NX_DAEMON: 'false' };

describe('nx-sonar e2e: token in nx.json', () => {
  const workspaceName = `nx-sonar-e2e-leak-${Date.now()}`;
  const workspaceRoot = join(tmpdir(), workspaceName);

  beforeAll(() => {
    rmSync(workspaceRoot, { recursive: true, force: true });
    execSync(
      `npx --yes create-nx-workspace@latest ${workspaceName} --preset apps --packageManager npm --nxCloud skip --no-interactive`,
      { cwd: tmpdir(), stdio: 'inherit', env: ciEnv },
    );
    execSync(`npm install --save-dev @itssky/nx-sonar@e2e`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: ciEnv,
    });
    execSync(`npx nx g @itssky/nx-sonar:init --skipPrompts`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: ciEnv,
    });
    execSync(`npx nx g @nx/js:library packages/sample --bundler=tsc`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: ciEnv,
    });
    execSync(
      `npx nx g @itssky/nx-sonar:configuration --project=sample --projectKey=org_sample`,
      { cwd: workspaceRoot, stdio: 'inherit', env: ciEnv },
    );
    const coverageDir = join(workspaceRoot, 'coverage', 'packages', 'sample');
    mkdirSync(coverageDir, { recursive: true });
    writeFileSync(join(coverageDir, 'lcov.info'), 'TN:\n');

    // Inject a token into nx.json to simulate a leaked config.
    const nxJsonPath = join(workspaceRoot, 'nx.json');
    const nxJson = JSON.parse(readFileSync(nxJsonPath, 'utf8'));
    nxJson.nxSonar = { ...(nxJson.nxSonar ?? {}), token: 'oh-no' };
    writeFileSync(nxJsonPath, JSON.stringify(nxJson, null, 2));
  });

  afterAll(() => rmSync(workspaceRoot, { recursive: true, force: true }));

  it('refuses the run with TokenInDiskConfigError', () => {
    let output = '';
    try {
      output = execSync(`npx nx run sample:sonar --skipNxCache`, {
        cwd: workspaceRoot,
        env: { ...ciEnv, SONAR_TOKEN: 'fine' },
      }).toString();
    } catch (e: any) {
      output = (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '');
    }
    expect(output).toMatch(/nx\.json/);
    expect(output).toMatch(/SONAR_TOKEN/);
  });
});
