import { CiContext } from './types';

type Env = Record<string, string | undefined>;

export function detectCiContext(env: Env): CiContext {
  return (
    detectGitHubActions(env) ??
    detectGitLab(env) ??
    detectCircleCi(env) ??
    detectBitbucket(env) ??
    null
  );
}

function detectGitHubActions(env: Env): CiContext {
  if (env.GITHUB_ACTIONS !== 'true') return null;
  if (
    env.GITHUB_EVENT_NAME === 'pull_request' ||
    env.GITHUB_EVENT_NAME === 'pull_request_target'
  ) {
    const key = parsePrFromRef(env.GITHUB_REF);
    return key
      ? {
          kind: 'pullRequest',
          key,
          branch: env.GITHUB_HEAD_REF ?? '',
          base: env.GITHUB_BASE_REF ?? 'main',
        }
      : null;
  }
  if (env.GITHUB_REF?.startsWith('refs/heads/')) {
    return { kind: 'branch', name: env.GITHUB_REF.slice('refs/heads/'.length) };
  }
  return null;
}

function detectGitLab(env: Env): CiContext {
  if (env.GITLAB_CI !== 'true') return null;
  if (env.CI_MERGE_REQUEST_IID) {
    return {
      kind: 'pullRequest',
      key: env.CI_MERGE_REQUEST_IID,
      branch: env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME ?? '',
      base: env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME ?? 'main',
    };
  }
  if (env.CI_COMMIT_BRANCH) {
    return { kind: 'branch', name: env.CI_COMMIT_BRANCH };
  }
  return null;
}

function detectCircleCi(env: Env): CiContext {
  if (env.CIRCLECI !== 'true') return null;
  if (env.CIRCLE_PULL_REQUEST) {
    const key = env.CIRCLE_PULL_REQUEST.split('/').pop();
    if (key) {
      return {
        kind: 'pullRequest',
        key,
        branch: env.CIRCLE_BRANCH ?? '',
        base: 'main',
      };
    }
  }
  if (env.CIRCLE_BRANCH) {
    return { kind: 'branch', name: env.CIRCLE_BRANCH };
  }
  return null;
}

function detectBitbucket(env: Env): CiContext {
  if (!env.BITBUCKET_BUILD_NUMBER) return null;
  if (env.BITBUCKET_PR_ID) {
    return {
      kind: 'pullRequest',
      key: env.BITBUCKET_PR_ID,
      branch: env.BITBUCKET_BRANCH ?? '',
      base: env.BITBUCKET_PR_DESTINATION_BRANCH ?? 'main',
    };
  }
  if (env.BITBUCKET_BRANCH) {
    return { kind: 'branch', name: env.BITBUCKET_BRANCH };
  }
  return null;
}

function parsePrFromRef(ref: string | undefined): string | null {
  const m = ref?.match(/^refs\/pull\/(\d+)\//);
  return m ? m[1] : null;
}
