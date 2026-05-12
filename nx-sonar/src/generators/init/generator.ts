import {
  formatFiles,
  readNxJson,
  updateNxJson,
  type Tree,
} from '@nx/devkit';
import { InitGeneratorSchema } from './schema';

const PLUGIN_NAME = '@itssky/nx-sonar';
const ENV_LINES = [
  '# @itssky/nx-sonar — required for `nx run <project>:sonar`',
  'SONAR_TOKEN=',
  'SONAR_HOST_URL=',
  'SONAR_ORGANIZATION=',
];

export async function initGenerator(
  tree: Tree,
  options: InitGeneratorSchema,
): Promise<void> {
  registerPluginInNxJson(tree, options);
  ensureGitignoreCoverage(tree);
  appendEnvExampleIfPresent(tree);
  await formatFiles(tree);
}

function registerPluginInNxJson(
  tree: Tree,
  options: InitGeneratorSchema,
): void {
  const nxJson = (readNxJson(tree) ?? {}) as Record<string, unknown> & {
    plugins?: Array<string | { plugin: string }>;
    nxSonar?: { hostUrl?: string; organization?: string };
  };

  const plugins = nxJson.plugins ?? [];
  const alreadyHasPlugin = plugins.some((p) =>
    typeof p === 'string' ? p === PLUGIN_NAME : p?.plugin === PLUGIN_NAME,
  );
  if (!alreadyHasPlugin) {
    plugins.push({ plugin: PLUGIN_NAME });
  }
  nxJson.plugins = plugins;

  const sonarDefaults: { hostUrl?: string; organization?: string } = {
    ...(nxJson.nxSonar ?? {}),
  };
  if (options.hostUrl) sonarDefaults.hostUrl = options.hostUrl;
  if (options.organization) sonarDefaults.organization = options.organization;
  if (Object.keys(sonarDefaults).length > 0) {
    nxJson.nxSonar = sonarDefaults;
  }

  updateNxJson(tree, nxJson as never);
}

function ensureGitignoreCoverage(tree: Tree): void {
  const path = '.gitignore';
  const existing = tree.exists(path) ? tree.read(path, 'utf-8') ?? '' : '';
  const lines = existing.split('\n');
  if (!lines.some((l) => l.trim() === 'coverage/')) {
    const updated =
      existing.length === 0 || existing.endsWith('\n')
        ? `${existing}coverage/\n`
        : `${existing}\ncoverage/\n`;
    tree.write(path, updated);
  }
}

function appendEnvExampleIfPresent(tree: Tree): void {
  const path = '.env.example';
  if (!tree.exists(path)) return;
  const existing = tree.read(path, 'utf-8') ?? '';
  if (existing.includes('SONAR_TOKEN=')) return;
  const sep = existing.endsWith('\n') ? '' : '\n';
  tree.write(path, `${existing}${sep}${ENV_LINES.join('\n')}\n`);
}

export default initGenerator;
