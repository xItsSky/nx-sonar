# @itssky/nx-sonar

> Turnkey nx plugin for SonarQube and SonarCloud scans.

[![npm version](https://img.shields.io/npm/v/@itssky/nx-sonar.svg)](https://www.npmjs.com/package/@itssky/nx-sonar)
[![CI](https://github.com/xItsSky/nx-sonar/actions/workflows/ci.yml/badge.svg)](https://github.com/xItsSky/nx-sonar/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/xItsSky/nx-sonar/branch/main/graph/badge.svg)](https://codecov.io/gh/xItsSky/nx-sonar)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

## What it does

`@itssky/nx-sonar` adds a `sonar` target to any nx project. The target runs
your tests with coverage (via `dependsOn: ["test"]`), then invokes the official
Sonar scanner — the binary is downloaded on first use, no separate install.

Works with **SonarQube** and **SonarCloud**, and with any test runner that
emits LCOV (jest, vitest, …).

## Install

```bash
npm install --save-dev @itssky/nx-sonar
```

## Quickstart

```bash
# 1. Configure the workspace
npx nx g @itssky/nx-sonar:init --hostUrl=https://sonarcloud.io --organization=my-org

# 2. Add a sonar target to a project
npx nx g @itssky/nx-sonar:configuration --project=my-app --projectKey=org_my-app

# 3. Run a scan (tests run first via dependsOn)
export SONAR_TOKEN=<your-token>
npx nx run my-app:sonar

# Or scan everything that's affected by your last change:
npx nx affected -t sonar
```

## Configuration

Options can live in three places (each later layer overrides the previous):

```
project.json target options  >  nx.json -> nxSonar  >  environment variables  >  built-in default
```

The `token` is **always** read from `SONAR_TOKEN` — never from `nx.json` or
`project.json`. The plugin refuses to start if a token is found in a
committed file.

### Executor options

| Option | Type | Default | Description |
|---|---|---|---|
| `projectKey` | string | required | Sonar project key |
| `projectName` | string | nx project name | Display name in Sonar |
| `projectVersion` | string | from `package.json` | |
| `hostUrl` | string | `https://sonarcloud.io` | Sonar server URL |
| `organization` | string | — | SonarCloud organization |
| `sources` | string \| string[] | project root | |
| `tests` | string \| string[] | unset | Optional `sonar.tests` value |
| `exclusions` | string[] | sensible defaults | Merged with workspace defaults |
| `coverageLcovPath` | string | `coverage/<projectRoot>/lcov.info` | LCOV report path |
| `testExecutionReportPath` | string | unset | JUnit XML test report (existence checked) |
| `qualityGateWait` | boolean | `true` | Fail the build if the Quality Gate fails |
| `branchDetection` | boolean | `true` | Auto-detect branch/PR from CI env vars |
| `extraProperties` | `Record<string,string>` | `{}` | Raw `sonar.*` properties (overrides built-ins) |
| `verbose` | boolean | `false` | Pass `-X` to the scanner |

### Environment variables

| Env var | Purpose |
|---|---|
| `SONAR_TOKEN` | **Required.** Authentication token. |
| `SONAR_HOST_URL` | Default `hostUrl` if not set in config. |
| `SONAR_ORGANIZATION` | Default `organization` if not set in config. |
| `SONAR_PROJECT_KEY` | Default `projectKey` if not set in config. |

### Workspace defaults

The `init` generator writes defaults under `nx.json` → `nxSonar`:

```json
{
  "nxSonar": {
    "hostUrl": "https://sonarcloud.io",
    "organization": "my-org",
    "exclusions": ["**/legacy/**"]
  }
}
```

## CI recipes

### GitHub Actions

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # required for Sonar branch analysis
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm ci
- run: npx nx affected -t sonar
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### GitLab CI

```yaml
sonar:
  image: node:20
  script:
    - npm ci
    - npx nx affected -t sonar
  variables:
    SONAR_TOKEN: $SONAR_TOKEN
```

Branch and merge-request context are auto-detected on GitHub Actions, GitLab
CI, CircleCI, and Bitbucket Pipelines.

## Troubleshooting

**`SONAR_TOKEN is not set`** — generate a token in your Sonar server and export
it before running. In CI, configure it as a secret.

**`Coverage report not found at coverage/<...>/lcov.info`** — enable LCOV in
your test runner:
- jest: `"coverageReporters": ["lcov"]` in `jest.config.ts`
- vitest: `"test.coverage.reporter": ["lcov"]` in `vite.config.ts`

**`A "token" was found in nx.json`** — remove it. Tokens belong in
`SONAR_TOKEN` only.

**Quality Gate failed but I don't want to block the build** — set
`qualityGateWait: false` in the target options.

## Migrating from `@koliveira15/nx-sonarqube`

| Old | New |
|---|---|
| executor name `@koliveira15/nx-sonarqube:scan` | `@itssky/nx-sonar:scan` |
| `hostUrl` (option) | same, also reads from `SONAR_HOST_URL` |
| `qualityGate` (option) | renamed to `qualityGateWait` |
| Token in options | refused — use `SONAR_TOKEN` env |
| Manual coverage merge step | not needed (per-project LCOV) |

## License

[MIT](../../LICENSE) © Quentin (xItsSky)
