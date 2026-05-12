import { CiContext, ResolvedOptions } from './types';
import { ResolvedPaths } from './resolve-project-paths';

export interface BuildPropsInput {
  options: ResolvedOptions;
  paths: ResolvedPaths;
  ciContext: CiContext;
}

export type ScannerProperties = Record<string, string>;

export function buildScannerProperties({
  options,
  paths,
  ciContext,
}: BuildPropsInput): ScannerProperties {
  const props: ScannerProperties = {};

  props['sonar.projectKey'] = options.projectKey;
  if (options.projectName) props['sonar.projectName'] = options.projectName;
  if (options.projectVersion)
    props['sonar.projectVersion'] = options.projectVersion;

  props['sonar.host.url'] = options.hostUrl;
  if (options.organization) props['sonar.organization'] = options.organization;
  props['sonar.token'] = options.token;

  props['sonar.sources'] = joinList(paths.sources);
  if (paths.tests) props['sonar.tests'] = joinList(paths.tests);

  props['sonar.javascript.lcov.reportPaths'] = paths.coveragePath;
  props['sonar.typescript.lcov.reportPaths'] = paths.coveragePath;
  if (paths.testExecutionReportPath)
    props['sonar.testExecutionReportPaths'] = paths.testExecutionReportPath;

  props['sonar.exclusions'] = options.exclusions.join(',');
  props['sonar.qualitygate.wait'] = String(options.qualityGateWait);
  if (options.verbose) props['sonar.verbose'] = 'true';

  if (options.branchDetection && ciContext) {
    if (ciContext.kind === 'branch') {
      props['sonar.branch.name'] = ciContext.name;
    } else {
      props['sonar.pullrequest.key'] = ciContext.key;
      props['sonar.pullrequest.branch'] = ciContext.branch;
      props['sonar.pullrequest.base'] = ciContext.base;
    }
  }

  // extraProperties last so users can override anything above.
  return { ...props, ...options.extraProperties };
}

function joinList(value: string | string[]): string {
  return Array.isArray(value) ? value.join(',') : value;
}
