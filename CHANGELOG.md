## [22.0.2](https://github.com/xItsSky/nx-sonar/compare/v22.0.1...v22.0.2) (2026-07-06)

### Bug Fixes

* **nx-sonar-e2e:** make sample lib generation self-contained ([#9](https://github.com/xItsSky/nx-sonar/issues/9)) ([2607635](https://github.com/xItsSky/nx-sonar/commit/2607635d40f3ebf3e98240f8cea906273c843164))

## [22.0.1](https://github.com/xItsSky/nx-sonar/compare/v22.0.0...v22.0.1) (2026-07-06)

### Bug Fixes

* **nx-sonar:** stop executor schema defaults from shadowing nx.json config ([#8](https://github.com/xItsSky/nx-sonar/issues/8)) ([e4d4c00](https://github.com/xItsSky/nx-sonar/commit/e4d4c008a662ebff1a9bdd36c7db8a372466a117))

## [22.0.0](https://github.com/xItsSky/nx-sonar/compare/v21.0.0...v22.0.0) (2026-07-03)

### ⚠ BREAKING CHANGES

* **nx-sonar:** @nx/devkit peer dependency is now ^22.0.0; nx 23+
workspaces must wait for the matching 23.x release.

Co-authored-by: Claude Code <noreply@anthropic.com>

### Features

* **nx-sonar:** align plugin major version with supported nx major ([#6](https://github.com/xItsSky/nx-sonar/issues/6)) ([472f62f](https://github.com/xItsSky/nx-sonar/commit/472f62f15c34ab57fd3fc92a68ec13e58bc77d9c))

### Bug Fixes

* **nx-sonar:** send token as sonar.login for SonarQube <= 9.x servers ([#5](https://github.com/xItsSky/nx-sonar/issues/5)) ([4b3b1c7](https://github.com/xItsSky/nx-sonar/commit/4b3b1c7ca29cf6b84a52001044f8260f0e9c1f0b))

## 1.0.0 (2026-05-13)

### Features

* initialize nx sonar plugin ([71a1f7e](https://github.com/xItsSky/nx-sonar/commit/71a1f7ebd87345a7f27c81269616fdeb1ac8ac19))

### Bug Fixes

* **nx-sonar-e2e:** do not pre-create workspace dir before create-nx-workspace ([#1](https://github.com/xItsSky/nx-sonar/issues/1)) ([e9ba3a8](https://github.com/xItsSky/nx-sonar/commit/e9ba3a84a405e768b77b9c4b99179cebaa6a71b5))
