<div align="center">

  <h1 align="center">@itssky/nx-sonar</h1>
  <p align="center"><strong>Turnkey SonarQube &amp; SonarCloud scans for Nx workspaces.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@itssky/nx-sonar"><img src="https://img.shields.io/npm/v/@itssky/nx-sonar.svg?style=for-the-badge" alt="npm version"></a>
    <a href="https://github.com/xItsSky/nx-sonar/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/xItsSky/nx-sonar/ci.yml?style=for-the-badge&amp;label=CI" alt="CI"></a>
    <a href="https://codecov.io/gh/xItsSky/nx-sonar"><img src="https://img.shields.io/codecov/c/github/xItsSky/nx-sonar?style=for-the-badge" alt="coverage"></a>
    <a href="LICENSE"><img src="https://img.shields.io/npm/l/@itssky/nx-sonar?style=for-the-badge" alt="license"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/@itssky/nx-sonar?style=for-the-badge" alt="node"></a>
  </p>

  <br />

  [**Plugin docs**](nx-sonar/README.md) &nbsp;&bull;&nbsp; [**Architecture**](docs/architecture.md) &nbsp;&bull;&nbsp; [**Contributing**](CONTRIBUTING.md) &nbsp;&bull;&nbsp; [**Changelog**](CHANGELOG.md)

  <br />

</div>

`@itssky/nx-sonar` is an Nx plugin that runs SonarQube or SonarCloud scans on any project in your workspace — in one command, with zero extra installs. Works with **any test runner that emits LCOV** (jest, vitest, …), auto-detects branch and pull-request context on the major CI providers, and stays out of your way the rest of the time.

## Quick start

```bash
# Install
npm install --save-dev @itssky/nx-sonar

# Configure the workspace once
npx nx g @itssky/nx-sonar:init --hostUrl=https://sonarcloud.io --organization=my-org

# Add a sonar target to a project
npx nx g @itssky/nx-sonar:configuration --project=my-app --projectKey=org_my-app

# Run a scan (tests run first via dependsOn)
export SONAR_TOKEN=<your-token>
npx nx run my-app:sonar

# …or scan everything affected by your last change
npx nx affected -t sonar
```

Full reference, recipes, troubleshooting, and migration guide live in the [**plugin docs**](nx-sonar/README.md).

## Why this plugin?

- **Turnkey.** Installing the package is enough. The Sonar scanner binary is downloaded and cached automatically on first run — no separate install, no PATH wrangling, no Docker image.
- **Both Sonar flavors.** SonarQube (self-hosted) and SonarCloud are first-class. Switch with one flag or one env var.
- **Test-runner agnostic.** Jest, Vitest, Mocha, whatever — if it emits LCOV at the standard path, it scans.
- **Monorepo native.** Per-project targets, `nx affected -t sonar`, `dependsOn: ["test"]` orchestration. No central config blob.
- **Secrets stay out of git.** Tokens live in `SONAR_TOKEN` only — the plugin refuses to start if it finds a token in `nx.json` or `project.json`.
- **CI-aware.** Branch and pull-request context auto-detected on GitHub Actions, GitLab CI, CircleCI, and Bitbucket Pipelines. Override anytime.
- **95 %+ test coverage.** Unit-tested utilities, e2e-tested generators and executor, lint and type-check clean.

## What's in this repo

```
nx-sonar/          # the published plugin (@itssky/nx-sonar)
nx-sonar-e2e/      # end-to-end tests
docs/              # architecture, ADRs, design specs
.github/workflows/ # CI, release, CodeQL
```

## Versioning &amp; support

Released automatically via [semantic-release](https://semantic-release.gitbook.io/) from conventional-commit messages. Releases follow [semver](https://semver.org).

Support matrix:

| Tool   | Versions                 |
| ------ | ------------------------ |
| Node   | 20.x, 22.x               |
| Nx     | latest 2 majors (≥ 22.x) |
| Jest   | 28+                      |
| Vitest | 1+                       |

## Contributing

Bug reports, fixes, recipes, and new features are all welcome — head over to [CONTRIBUTING.md](CONTRIBUTING.md) for setup and conventions, and to [our discussions](https://github.com/xItsSky/nx-sonar/discussions) if you'd rather ask first.

This project follows the [Contributor Code of Conduct](CODE_OF_CONDUCT.md). For security disclosures, see [SECURITY.md](SECURITY.md).

## Contributors

Every commit, issue, review, and recipe shaping this plugin shows up here. Thanks to all of them.

<a href="https://github.com/xItsSky/nx-sonar/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=xItsSky/nx-sonar" alt="Contributors to xItsSky/nx-sonar" />
</a>

*Avatars auto-rendered by [contrib.rocks](https://contrib.rocks) — no extra tooling, the grid updates as soon as a PR merges.*

## License

[MIT](LICENSE) © Quentin (xItsSky)
