export interface ScanExecutorOptions {
  projectKey?: string;
  projectName?: string;
  projectVersion?: string;
  hostUrl?: string;
  organization?: string;
  sources?: string | string[];
  tests?: string | string[];
  exclusions?: string[];
  coverageLcovPath?: string;
  testExecutionReportPath?: string;
  qualityGateWait?: boolean;
  branchDetection?: boolean;
  extraProperties?: Record<string, string>;
  verbose?: boolean;
}

export interface NxJsonSonarConfig {
  hostUrl?: string;
  organization?: string;
  exclusions?: string[];
  qualityGateWait?: boolean;
  branchDetection?: boolean;
  extraProperties?: Record<string, string>;
}

export interface ResolvedOptions {
  projectKey: string;
  projectName?: string;
  projectVersion?: string;
  hostUrl: string;
  organization?: string;
  sources?: string | string[];
  tests?: string | string[];
  exclusions: string[];
  coverageLcovPath?: string;
  testExecutionReportPath?: string;
  qualityGateWait: boolean;
  branchDetection: boolean;
  extraProperties: Record<string, string>;
  verbose: boolean;
  token: string;
}

export const DEFAULT_EXCLUSIONS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/*.spec.ts',
  '**/*.test.ts',
  '**/*.spec.tsx',
  '**/*.test.tsx',
] as const;

export const DEFAULT_HOST_URL = 'https://sonarcloud.io';

export type CiContext =
  | { kind: 'branch'; name: string }
  | { kind: 'pullRequest'; key: string; branch: string; base: string }
  | null;
