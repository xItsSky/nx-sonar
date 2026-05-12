import {
  InvalidConfigError,
  MissingTokenError,
  TokenInDiskConfigError,
} from './errors';
import {
  DEFAULT_EXCLUSIONS,
  DEFAULT_HOST_URL,
  NxJsonSonarConfig,
  ResolvedOptions,
  ScanExecutorOptions,
} from './types';

export interface ResolveInput {
  projectOptions: ScanExecutorOptions;
  nxJsonConfig: NxJsonSonarConfig;
  env: NodeJS.ProcessEnv | Record<string, string | undefined>;
}

export function resolveOptions({
  projectOptions,
  nxJsonConfig,
  env,
}: ResolveInput): ResolvedOptions {
  refuseTokenInDiskConfig(projectOptions, 'project.json');
  refuseTokenInDiskConfig(nxJsonConfig, 'nx.json');

  const token = env.SONAR_TOKEN;
  if (!token || token.trim() === '') {
    throw new MissingTokenError();
  }

  const projectKey =
    projectOptions.projectKey ??
    (nxJsonConfig as ScanExecutorOptions).projectKey ??
    env.SONAR_PROJECT_KEY;
  if (!projectKey) {
    throw new InvalidConfigError(
      'projectKey is required. Set it in the sonar target options, in nx.json under nxSonar, or via the SONAR_PROJECT_KEY env var.',
    );
  }

  const hostUrl =
    projectOptions.hostUrl ??
    nxJsonConfig.hostUrl ??
    env.SONAR_HOST_URL ??
    DEFAULT_HOST_URL;

  const organization =
    projectOptions.organization ??
    nxJsonConfig.organization ??
    env.SONAR_ORGANIZATION;

  const exclusions = uniq([
    ...DEFAULT_EXCLUSIONS,
    ...(nxJsonConfig.exclusions ?? []),
    ...(projectOptions.exclusions ?? []),
  ]);

  const extraProperties: Record<string, string> = {
    ...(nxJsonConfig.extraProperties ?? {}),
    ...(projectOptions.extraProperties ?? {}),
  };

  return {
    projectKey,
    projectName: projectOptions.projectName,
    projectVersion: projectOptions.projectVersion,
    hostUrl,
    organization,
    sources: projectOptions.sources,
    tests: projectOptions.tests,
    exclusions,
    coverageLcovPath: projectOptions.coverageLcovPath,
    testExecutionReportPath: projectOptions.testExecutionReportPath,
    qualityGateWait:
      projectOptions.qualityGateWait ?? nxJsonConfig.qualityGateWait ?? true,
    branchDetection:
      projectOptions.branchDetection ?? nxJsonConfig.branchDetection ?? true,
    extraProperties,
    verbose: projectOptions.verbose ?? false,
    token,
  };
}

function refuseTokenInDiskConfig(
  config: object,
  source: string,
): void {
  if (config && typeof config === 'object' && 'token' in config) {
    throw new TokenInDiskConfigError(source);
  }
}

function uniq<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}
