import type { ExecutorContext } from '@nx/devkit';
import { buildScannerProperties } from '../../utils/build-scanner-properties';
import { detectCiContext } from '../../utils/detect-ci-context';
import { NxSonarError } from '../../utils/errors';
import { resolveOptions } from '../../utils/resolve-options';
import { resolveProjectPaths } from '../../utils/resolve-project-paths';
import { runScanner } from '../../utils/run-scanner';
import type {
  NxJsonSonarConfig,
  ScanExecutorOptions,
} from '../../utils/types';

export default async function scanExecutor(
  options: ScanExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const projectConfig =
      context.projectsConfigurations?.projects?.[context.projectName ?? ''];
    if (!projectConfig) {
      throw new NxSonarError(
        `Cannot resolve project config for "${context.projectName}".`,
      );
    }

    const nxJsonConfig: NxJsonSonarConfig =
      ((context.nxJsonConfiguration as { nxSonar?: NxJsonSonarConfig })
        ?.nxSonar ?? {}) as NxJsonSonarConfig;

    const resolved = resolveOptions({
      projectOptions: options,
      nxJsonConfig,
      env: process.env,
    });

    const paths = resolveProjectPaths({
      workspaceRoot: context.root,
      projectRoot: projectConfig.root,
      options,
    });

    const ciContext = detectCiContext(process.env);

    const properties = buildScannerProperties({
      options: resolved,
      paths,
      ciContext,
    });

    const result = await runScanner(properties);
    return { success: result.success };
  } catch (err) {
    if (err instanceof NxSonarError) {
      console.error(`[@itssky/nx-sonar] ${err.message}`);
      return { success: false };
    }
    throw err;
  }
}
