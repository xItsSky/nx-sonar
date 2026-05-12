# Contributing to `@itssky/nx-sonar`

Thanks for considering a contribution! This document walks through how to set up the project, the conventions we follow, and how a change gets shipped.

## Got a question?

GitHub issues are reserved for bug reports and concrete feature requests. For usage questions, "is this the right approach?" discussions, or anything open-ended, please head to [**GitHub Discussions**](https://github.com/xItsSky/nx-sonar/discussions) instead.

## Found a bug?

If you've found a reproducible bug, please [submit an issue](https://github.com/xItsSky/nx-sonar/issues/new/choose) using the **Bug report** template — it asks for the versions, the repro steps, and the expected vs. actual behavior we need to triage quickly. A link to a minimal public reproduction repo speeds things up dramatically.

Even better: open a pull request with the fix (see [Submitting a PR](#submitting-a-pr) below).

## Want a new feature?

Open an issue with the **Feature request** template first — we'd rather sketch the design with you before you spend time on an implementation that we'd have to ask you to redo. For larger features, an ADR (see `docs/adr/`) may be part of the proposal.

## Project structure

```
nx-sonar/                 # the published plugin (@itssky/nx-sonar)
  src/executors/scan/     # the scan executor
  src/generators/         # init and configuration generators
  src/utils/              # pure utilities (option merge, CI detection, …)
nx-sonar-e2e/             # end-to-end tests — never published
docs/
  architecture.md         # module map + data flow
  adr/                    # architectural decision records
  superpowers/specs/      # design specs
  superpowers/plans/      # implementation plans
.github/workflows/        # CI, release, CodeQL
tools/scripts/            # local verdaccio registry helpers
```

The plugin and its e2e project are managed by Nx. Source code is TypeScript, tests are Jest, the scanner binary is downloaded on demand by [`sonarqube-scanner`](https://www.npmjs.com/package/sonarqube-scanner).

## Development setup

### Prerequisites

- **Node:** 20.x or 22.x. Older versions will throw `engines` warnings and break the e2e suite.
- **npm:** 10+ (comes with Node 20+).
- **A Sonar account** is **not** required for development — the e2e suite uses a dry-run hook that never contacts a real server.

### Install

```bash
git clone https://github.com/xItsSky/nx-sonar.git
cd nx-sonar
npm ci
```

### Common commands

```bash
npm run lint        # ESLint across all projects
npm run typecheck   # tsc --noEmit
npm test            # unit tests + coverage
npm run build       # build the publishable plugin
npm run e2e         # full e2e suite (NX_SONAR_DRY_RUN — no real scanner call)
npm run format      # Prettier write
```

Run **lint + typecheck + test + build + e2e** locally before opening a PR. CI runs the same set on Node 20 and 22 and must be green before merge.

### Working on the executor or a util

The pure utilities in `nx-sonar/src/utils/` are the easiest place to land a first contribution — every one has a co-located `*.spec.ts` with tight unit tests. Add a failing test, make it pass, commit. See [`docs/architecture.md`](docs/architecture.md) for how the pieces fit.

### Working on a generator

Generators are tested against an in-memory `Tree` via `createTreeWithEmptyWorkspace()` from `@nx/devkit/testing`. Keep the generator idempotent — re-running it on an already-configured workspace must be a no-op.

### Working on the e2e suite

E2e tests scaffold a fresh workspace, install the locally-built plugin from a verdaccio registry, run generators and the executor in **dry-run mode** (the executor writes its computed property bag to a JSON file instead of calling the real Sonar scanner), and assert on that bag.

The verdaccio harness is in `tools/scripts/`. To run a single e2e spec:

```bash
npx nx run nx-sonar-e2e:e2e --testFile=missing-token.spec.ts
```

> 💡 E2e tests are slow (they spin up a real Nx workspace per scenario). Use `--testFile=…` while iterating; let CI run the full suite.

## Branch naming

- `feat/<short-desc>` — new feature
- `fix/<short-desc>` — bug fix
- `docs/<short-desc>` — documentation only
- `chore/<short-desc>` — tooling / repo plumbing
- `test/<short-desc>` — tests only
- From an issue: `feat/#<number>-<desc>` (issue number mandatory)

Never push directly to `main` — it's the release branch.

## Commit conventions

We use [**Conventional Commits**](https://www.conventionalcommits.org/). This is **required**: `semantic-release` reads commit messages to compute the next version and the changelog. A non-conforming commit doesn't fail the build, but it also won't trigger or describe a release.

```
<type>(<scope>): <description>

[optional body — explain the WHY]

[optional footers]
```

| Type     | When to use                                          |
| -------- | ---------------------------------------------------- |
| `feat`   | A new user-visible feature                           |
| `fix`    | A bug fix                                            |
| `docs`   | Documentation only                                   |
| `refactor` | Code change that's neither feature nor fix         |
| `perf`   | Performance improvement                              |
| `test`   | Test additions / changes only                        |
| `build`  | Build system or dependency changes                   |
| `ci`     | CI configuration                                     |
| `chore`  | Everything else (tooling, repo plumbing)             |
| `revert` | Reverting a prior commit                             |

Scopes match Nx project names: `nx-sonar`, `nx-sonar-e2e`. Omit the scope for repo-wide changes.

Breaking changes: append `!` (`feat(nx-sonar)!: drop legacy …`) **or** add a `BREAKING CHANGE: <description>` footer.

## Submitting a PR

1. Fork the repo, branch off `main`, push.
2. Open the PR — the template will ask for a summary, the issue link, and a test plan.
3. Link the issue with `Closes #<n>` or `Refs #<n>`.
4. Keep PRs **focused**: one logical change per PR.
5. Make sure CI is green.
6. A maintainer will review. Please don't merge your own PR.

## Tests

Every feature or bug fix needs a test — no exceptions. Unit tests live next to the file they cover (`*.spec.ts`); e2e tests live in `nx-sonar-e2e/`. Coverage floor is **80 % statements** per package; CI fails below that.

If a test you've written is flaky, please file an issue with `flake` in the title — fixing the flake is a first-class contribution.

## Releasing

Releases are automatic. When commits land on `main`, [semantic-release](https://semantic-release.gitbook.io/) parses them, bumps the version, regenerates `CHANGELOG.md`, publishes to npm, and cuts a GitHub release. **There is no manual `npm version` / `npm publish` step** — please don't run them.

Beta pre-releases ship from a `beta` branch when needed and are published with the `beta` dist-tag.

## License

By contributing, you agree that your contribution will be licensed under the [MIT License](LICENSE).
