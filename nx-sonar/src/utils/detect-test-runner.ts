import type { ProjectConfiguration } from '@nx/devkit';

export type TestRunner = 'jest' | 'vitest' | 'other' | 'none';

export function detectTestRunner(project: ProjectConfiguration): TestRunner {
  const executor = project.targets?.test?.executor;
  if (!executor) return 'none';
  if (executor.includes('jest')) return 'jest';
  if (executor.includes('vite')) return 'vitest';
  return 'other';
}
