import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readJson, updateJson, type Tree } from '@nx/devkit';
import { initGenerator } from './generator';

describe('init generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('registers the plugin in nx.json', async () => {
    await initGenerator(tree, { skipPrompts: true });
    const nxJson = readJson(tree, 'nx.json');
    expect(nxJson.plugins ?? []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ plugin: '@itssky/nx-sonar' }),
      ]),
    );
  });

  it('writes nxSonar defaults from options', async () => {
    await initGenerator(tree, {
      hostUrl: 'https://sonar.acme.com',
      organization: 'acme',
      skipPrompts: true,
    });
    const nxJson = readJson(tree, 'nx.json') as any;
    expect(nxJson.nxSonar).toEqual({
      hostUrl: 'https://sonar.acme.com',
      organization: 'acme',
    });
  });

  it('is idempotent — re-running does not duplicate the plugin entry', async () => {
    await initGenerator(tree, { skipPrompts: true });
    await initGenerator(tree, { skipPrompts: true });
    const nxJson = readJson(tree, 'nx.json') as any;
    const matches = (nxJson.plugins ?? []).filter((p: any) =>
      typeof p === 'string'
        ? p === '@itssky/nx-sonar'
        : p?.plugin === '@itssky/nx-sonar',
    );
    expect(matches).toHaveLength(1);
  });

  it('is idempotent when the plugin is already registered as a bare string', async () => {
    updateJson(tree, 'nx.json', (json) => {
      json.plugins = ['@itssky/nx-sonar'];
      return json;
    });
    await initGenerator(tree, { skipPrompts: true });
    const nxJson = readJson(tree, 'nx.json') as any;
    const matches = (nxJson.plugins ?? []).filter((p: any) =>
      typeof p === 'string'
        ? p === '@itssky/nx-sonar'
        : p?.plugin === '@itssky/nx-sonar',
    );
    expect(matches).toHaveLength(1);
  });

  it('creates .gitignore with coverage/ when the file is absent', async () => {
    await initGenerator(tree, { skipPrompts: true });
    expect(tree.read('.gitignore', 'utf-8')).toContain('coverage/');
  });

  it('appends coverage/ on a new line when .gitignore has no trailing newline', async () => {
    tree.write('.gitignore', 'node_modules');
    await initGenerator(tree, { skipPrompts: true });
    expect(tree.read('.gitignore', 'utf-8')).toBe('node_modules\ncoverage/\n');
  });

  it('adds coverage/ to .gitignore if not present', async () => {
    tree.write('.gitignore', 'node_modules\n');
    await initGenerator(tree, { skipPrompts: true });
    expect(tree.read('.gitignore', 'utf-8')).toContain('coverage/');
  });

  it('does not duplicate coverage/ in .gitignore', async () => {
    tree.write('.gitignore', 'node_modules\ncoverage/\n');
    await initGenerator(tree, { skipPrompts: true });
    const content = tree.read('.gitignore', 'utf-8') ?? '';
    const occurrences = content.match(/^coverage\//gm) ?? [];
    expect(occurrences).toHaveLength(1);
  });

  it('appends SONAR_* placeholders to .env.example when it exists', async () => {
    tree.write('.env.example', 'EXISTING=value\n');
    await initGenerator(tree, { skipPrompts: true });
    const env = tree.read('.env.example', 'utf-8') ?? '';
    expect(env).toContain('SONAR_TOKEN=');
    expect(env).toContain('SONAR_HOST_URL=');
    expect(env).toContain('SONAR_ORGANIZATION=');
  });

  it('appends SONAR_* placeholders on a new line when .env.example has no trailing newline', async () => {
    tree.write('.env.example', 'EXISTING=value');
    await initGenerator(tree, { skipPrompts: true });
    const env = tree.read('.env.example', 'utf-8') ?? '';
    expect(env).toBe('EXISTING=value\n# @itssky/nx-sonar — required for `nx run <project>:sonar`\nSONAR_TOKEN=\nSONAR_HOST_URL=\nSONAR_ORGANIZATION=\n');
  });

  it('leaves .env.example untouched when SONAR_TOKEN is already present', async () => {
    tree.write('.env.example', 'SONAR_TOKEN=abc\n');
    await initGenerator(tree, { skipPrompts: true });
    expect(tree.read('.env.example', 'utf-8')).toBe('SONAR_TOKEN=abc\n');
  });

  it('does not create .env.example if absent', async () => {
    await initGenerator(tree, { skipPrompts: true });
    expect(tree.exists('.env.example')).toBe(false);
  });
});
