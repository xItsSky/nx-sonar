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

  it('does not create .env.example if absent', async () => {
    await initGenerator(tree, { skipPrompts: true });
    expect(tree.exists('.env.example')).toBe(false);
  });
});
