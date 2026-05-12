import { detectCiContext } from './detect-ci-context';

describe('detectCiContext', () => {
  it('returns null when no CI env vars are present', () => {
    expect(detectCiContext({})).toBeNull();
  });

  describe('GitHub Actions', () => {
    it('detects a PR from GITHUB_EVENT_NAME=pull_request', () => {
      expect(
        detectCiContext({
          GITHUB_ACTIONS: 'true',
          GITHUB_EVENT_NAME: 'pull_request',
          GITHUB_REF: 'refs/pull/42/merge',
          GITHUB_HEAD_REF: 'feature/x',
          GITHUB_BASE_REF: 'main',
        }),
      ).toEqual({
        kind: 'pullRequest',
        key: '42',
        branch: 'feature/x',
        base: 'main',
      });
    });

    it('detects a branch from GITHUB_REF on push', () => {
      expect(
        detectCiContext({
          GITHUB_ACTIONS: 'true',
          GITHUB_EVENT_NAME: 'push',
          GITHUB_REF: 'refs/heads/develop',
        }),
      ).toEqual({ kind: 'branch', name: 'develop' });
    });
  });

  describe('GitLab CI', () => {
    it('detects a merge request', () => {
      expect(
        detectCiContext({
          GITLAB_CI: 'true',
          CI_MERGE_REQUEST_IID: '7',
          CI_MERGE_REQUEST_SOURCE_BRANCH_NAME: 'feat/foo',
          CI_MERGE_REQUEST_TARGET_BRANCH_NAME: 'main',
        }),
      ).toEqual({
        kind: 'pullRequest',
        key: '7',
        branch: 'feat/foo',
        base: 'main',
      });
    });

    it('detects a branch from CI_COMMIT_BRANCH', () => {
      expect(
        detectCiContext({
          GITLAB_CI: 'true',
          CI_COMMIT_BRANCH: 'develop',
        }),
      ).toEqual({ kind: 'branch', name: 'develop' });
    });
  });

  describe('CircleCI', () => {
    it('detects a PR from CIRCLE_PULL_REQUEST', () => {
      expect(
        detectCiContext({
          CIRCLECI: 'true',
          CIRCLE_PULL_REQUEST: 'https://github.com/o/r/pull/13',
          CIRCLE_BRANCH: 'feat/x',
        }),
      ).toEqual({
        kind: 'pullRequest',
        key: '13',
        branch: 'feat/x',
        base: 'main',
      });
    });

    it('detects a branch from CIRCLE_BRANCH', () => {
      expect(
        detectCiContext({
          CIRCLECI: 'true',
          CIRCLE_BRANCH: 'develop',
        }),
      ).toEqual({ kind: 'branch', name: 'develop' });
    });
  });

  describe('Bitbucket Pipelines', () => {
    it('detects a PR', () => {
      expect(
        detectCiContext({
          BITBUCKET_BUILD_NUMBER: '1',
          BITBUCKET_PR_ID: '5',
          BITBUCKET_BRANCH: 'feat/x',
          BITBUCKET_PR_DESTINATION_BRANCH: 'main',
        }),
      ).toEqual({
        kind: 'pullRequest',
        key: '5',
        branch: 'feat/x',
        base: 'main',
      });
    });

    it('detects a branch', () => {
      expect(
        detectCiContext({
          BITBUCKET_BUILD_NUMBER: '1',
          BITBUCKET_BRANCH: 'develop',
        }),
      ).toEqual({ kind: 'branch', name: 'develop' });
    });
  });
});
