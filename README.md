# jot-vm

**jot-vm** is a command line task-version management tool, using semantic versioning to group tasks. Project information is kept in a local `.journal.json` file recording build versions and tasks. Versioning is opinionated and based on task completion, i.e., `journal next <version>` will fail, if the current version has incomplete tasks.

### Install

```sh
> npm install --location=global jot-vm
```

### Usage

```sh
journal usage
```

## `journal`

The base command for manipulating and getting info about the `.journal.json` file

## Commands

`clear` &emsp; deletes all tasks in the current version of the journal

`delete` &emsp; deletes the .journal.json file if it exists

`init <name> [options]` &emsp; initalizes a new .journal.json file

&emsp; `-n, --version-name <name>` &emsp; starting version name

&emsp; `-o, --overwrite` &emsp; overwrites the file if it exists

&emsp; `-t, --tag <tag>` &emsp; starting tag

&emsp; `-v, --version <version>` &emsp; starting version

`next <version> [options]` &emsp; increments the indicated version type

&emsp; `major` &emsp; increments major version

&emsp; `minor` &emsp; increments minor version

&emsp; `patch` &emsp; increments patch version

&emsp; `-t, --tag <tag>` &emsp; tag for version

`revert` &emsp; moves project to previous version

`status` &emsp; ouputs the version and task information

`tasks [options]` &emsp; outputs the tasks in this journal

&emsp; `-d, --done` &emsp; outputs all complete tasks

&emsp; `--no-done` &emsp; ouputs all incomplete tasks

&emsp; `-v, --version <version>` &emsp; outputs tasks for the given version

`usage` &emsp; ouputs the usage text

## `jot`

The base command for task management

## Commands

`check <ids...>` &emsp; checks the tasks at the given ids

`delete <ids...>` &emsp; deletes the tasks with the given ids

`finish` &emsp; marks all incomplete tasks as done

`move <id> [options]` &emsp; moves a task to a specified group, or from its group

&emsp; `-g, --group <group>` &emsp; group for the given task

`task <task> [options]` &emsp; creates a new task

&emsp; `-g, --group <group>` &emsp; group for the given task

`tasks <tasks...> [options]` &emsp; batch creates new tasks

&emsp; `-g, --group <group>` &emsp; group for the given tasks

`uncheck <ids...>` &emsp; checks the tasks at the given ids

`status <ids...>` &emsp; outputs the information for the given tasks

&emsp; `-c, --creation` &emsp; time of creation for the given task

&emsp; `-g, --group` &emsp; group for the given task

&emsp; `-s, --state` &emsp; time of completion or `false` for the given task

&emsp; `-v, --version` &emsp; version for the given task