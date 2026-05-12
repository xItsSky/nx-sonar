import { existsSync } from 'fs';
import { join } from 'path';
import { MissingCoverageError } from './errors';
import { ScanExecutorOptions } from './types';

export interface ResolvedPaths {
  sources: string | string[];
  tests?: string | string[];
  coveragePath: string;
  testExecutionReportPath?: string;
}

export interface ResolvePathsInput {
  workspaceRoot: string;
  projectRoot: string;
  options: ScanExecutorOptions;
}

export function resolveProjectPaths({
  workspaceRoot,
  projectRoot,
  options,
}: ResolvePathsInput): ResolvedPaths {
  const sources = options.sources ?? projectRoot;
  const tests = options.tests;

  const coveragePath =
    options.coverageLcovPath ?? `coverage/${projectRoot}/lcov.info`;

  if (!existsSync(join(workspaceRoot, coveragePath))) {
    throw new MissingCoverageError(coveragePath);
  }

  let testExecutionReportPath: string | undefined;
  if (options.testExecutionReportPath) {
    if (existsSync(join(workspaceRoot, options.testExecutionReportPath))) {
      testExecutionReportPath = options.testExecutionReportPath;
    } else {
      console.warn(
        `[@itssky/nx-sonar] testExecutionReportPath "${options.testExecutionReportPath}" not found — omitting from scanner properties.`,
      );
    }
  }

  return { sources, tests, coveragePath, testExecutionReportPath };
}
