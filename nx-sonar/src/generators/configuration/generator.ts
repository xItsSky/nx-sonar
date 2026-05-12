import {
  formatFiles,
  readProjectConfiguration,
  updateProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { detectTestRunner } from '../../utils/detect-test-runner';
import { ConfigurationGeneratorSchema } from './schema';

const EXECUTOR = '@itssky/nx-sonar:scan';

export async function configurationGenerator(
  tree: Tree,
  options: ConfigurationGeneratorSchema,
): Promise<void> {
  const project = readProjectConfiguration(tree, options.project);

  if (project.targets?.sonar && !options.force) {
    throw new Error(
      `Project "${options.project}" already exists with a sonar target. Re-run with --force to overwrite.`,
    );
  }

  const runner = detectTestRunner(project);
  if (runner === 'none') {
    console.warn(
      `[@itssky/nx-sonar] Project "${options.project}" has no \`test\` target. The sonar target will still be added with dependsOn:["test"], but it will fail until you configure tests with coverage.`,
    );
  } else {
    warnIfCoverageNotConfigured(runner, project);
  }

  const sonarTarget = {
    executor: EXECUTOR,
    dependsOn: ['test'],
    options: {
      ...(options.projectKey ? { projectKey: options.projectKey } : {}),
      projectName: options.project,
    },
  };

  project.targets = {
    ...(project.targets ?? {}),
    sonar: sonarTarget,
  };
  updateProjectConfiguration(tree, options.project, project);
  await formatFiles(tree);
}

function warnIfCoverageNotConfigured(
  runner: 'jest' | 'vitest' | 'other',
  project: { targets?: Record<string, { options?: Record<string, unknown> }> },
): void {
  const opts = project.targets?.test?.options ?? {};
  const hasCoverage =
    'coverage' in opts ||
    'codeCoverage' in opts ||
    'collectCoverage' in opts;
  if (!hasCoverage) {
    console.warn(
      `[@itssky/nx-sonar] The "test" target does not appear to enable coverage. ` +
        `For ${runner}, enable coverage so an lcov.info file is produced at coverage/<projectRoot>/lcov.info.`,
    );
  }
}

export default configurationGenerator;
