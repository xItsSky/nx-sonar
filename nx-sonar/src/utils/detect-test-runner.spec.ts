import { detectTestRunner } from './detect-test-runner';
import type { ProjectConfiguration } from '@nx/devkit';

const fakeProject = (testExecutor?: string): ProjectConfiguration =>
  ({
    root: 'apps/my-app',
    targets: testExecutor
      ? { test: { executor: testExecutor } }
      : {},
  }) as ProjectConfiguration;

describe('detectTestRunner', () => {
  it('detects jest', () => {
    expect(detectTestRunner(fakeProject('@nx/jest:jest'))).toBe('jest');
  });

  it('detects vitest', () => {
    expect(detectTestRunner(fakeProject('@nx/vite:test'))).toBe('vitest');
  });

  it('returns "other" for an unknown test executor', () => {
    expect(detectTestRunner(fakeProject('some/custom:executor'))).toBe('other');
  });

  it('returns "none" when no test target exists', () => {
    expect(detectTestRunner(fakeProject())).toBe('none');
  });
});
