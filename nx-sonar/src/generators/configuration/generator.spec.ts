import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  addProjectConfiguration,
  readProjectConfiguration,
  updateProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { configurationGenerator } from './generator';

describe('configuration generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      projectType: 'application',
      targets: {
        test: {
          executor: '@nx/jest:jest',
          options: { jestConfig: 'apps/my-app/jest.config.ts' },
        },
      },
    });
  });

  it('adds a sonar target with dependsOn:["test"]', async () => {
    await configurationGenerator(tree, {
      project: 'my-app',
      projectKey: 'org_my-app',
    });
    const project = readProjectConfiguration(tree, 'my-app');
    expect(project.targets?.sonar).toEqual({
      executor: '@itssky/nx-sonar:scan',
      dependsOn: ['test'],
      options: { projectKey: 'org_my-app', projectName: 'my-app' },
    });
  });

  it('refuses to overwrite an existing sonar target without --force', async () => {
    const project = readProjectConfiguration(tree, 'my-app');
    project.targets = {
      ...project.targets,
      sonar: { executor: 'some/other:executor' },
    };
    updateProjectConfiguration(tree, 'my-app', project);
    await expect(
      configurationGenerator(tree, {
        project: 'my-app',
        projectKey: 'org_my-app',
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it('overwrites an existing sonar target with --force', async () => {
    const project = readProjectConfiguration(tree, 'my-app');
    project.targets = {
      ...project.targets,
      sonar: { executor: 'some/other:executor' },
    };
    updateProjectConfiguration(tree, 'my-app', project);
    await configurationGenerator(tree, {
      project: 'my-app',
      projectKey: 'org_my-app',
      force: true,
    });
    const updated = readProjectConfiguration(tree, 'my-app');
    expect(updated.targets?.sonar.executor).toBe('@itssky/nx-sonar:scan');
  });

  it('warns when no test target exists', async () => {
    addProjectConfiguration(tree, 'lib-no-test', {
      root: 'libs/lib-no-test',
      projectType: 'library',
      targets: {},
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    await configurationGenerator(tree, {
      project: 'lib-no-test',
      projectKey: 'org_lib-no-test',
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no `test` target'));
    warn.mockRestore();
  });

  it('warns when jest coverage is not configured', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    await configurationGenerator(tree, {
      project: 'my-app',
      projectKey: 'org_my-app',
    });
    // The test target has no `coverage: true` option, so we expect a coverage warning.
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('coverage'));
    warn.mockRestore();
  });
});
