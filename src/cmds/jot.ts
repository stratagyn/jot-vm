import {Command} from "commander";
import {$cmn as $, $jot, $journal} from "./cmn";

export const check_ = (cmd: Command) => {
    cmd.command("check")
        .description("checks tasks as done")
        .argument("<indices...>")
        .action((indices: string[]) => $journal.importThen(
            journal => indices.forEach(index => $jot.check(parseInt(index), journal)),
            `Failed to check tasks: [${indices.join()}]`
        ));
}

export const delete_ = (cmd: Command) => {
    cmd.command("delete")
        .description("delete given task")
        .argument("<indices...>")
        .action((indices: string[]) => $journal.importThen(
            journal => {
                const tasks = $journal.currentTasks(journal), n = tasks.length;

                if (n > 0) {
                    indices.map(index => parseInt(index))
                        .filter(index => index >= -n && index < n)
                        .forEach(index => tasks.splice(index, 1));

                    $journal.write(journal);
                }
            },
            `Failed to delete tasks: [${indices.join()}]`));
}

export const finish_ = (cmd: Command) => {
    cmd.command("finish")
        .description("checks all remaining unfinished tasks")
        .action(() => $journal.importThen(
            journal => {
                const done = $.localeGMTDate();
                const tasks = $journal.currentTasks(journal);

                if (tasks.length > 0) {
                   tasks.forEach(task => {
                        if (!task.done)
                            task.done = done;
                    });

                    $journal.write(journal);
                }
            }));
}

export const move_ = (cmd: Command) => {
    cmd.command("move")
        .description("moves a task to another group or from it's group if one isn't specified")
        .argument("<index>", "the task to move")
        .option("-g, --group <group>", "the group to move the task to")
        .action((index, options) => $journal.importThen(
            journal => {
                const task = $jot.taskat(parseInt(index), journal);

                if (task)
                    task.group = options.group;

                $journal.write(journal);
            }
        ))
}

export const status_ = (cmd: Command) => {
    cmd.command("status")
        .description("information about given task")
        .argument("<indices...>")
        .option("-g, --group", "group of the given task")
        .option("-c, --creation", "time of creation for the given task")
        .option("-v, --version", "version of the given task")
        .option("-s, --state", "time of completion or `false` for the given task")
        .action((indices: string[], options) => $journal.importThen(
            journal => {
                const tasks = $journal.currentTasks(journal), n = tasks.length;

                if (n === 0)
                    return;

                indices
                    .map(i => parseInt(i) - 1)
                    .filter(i => i >= -n && i < n)
                    .forEach((i, j) => {
                        const version = $.version(journal.version);
                        const details = $jot.gather(tasks[i], i, version, options);
                        console.log(`${j > 0 ? '\n' : ''}${details.join('\n')}`);
                    });
            },
            `Failed to get status for tasks: [${indices.join()}]`));
}

export const task_ = (cmd: Command) => {
    cmd.command("task")
        .description("creates a new task in the journal")
        .argument("<action>")
        .option("-g, --group <group>", "which group the task belongs to, e.g. bug, feature")
        .action((action, options) => $journal.importThen(
            journal => {
                const version = $.version(journal.version);
                const task = $jot.task(action, version, options.group);

                if (!(version in journal.tasks))
                    journal.tasks[version] = [];

                journal.tasks[version].push(task);

                $journal.write(journal);
            }, `Failed to create task: ${action}`
        ));
}

export const tasks_ = (cmd: Command) => {
    cmd.command("tasks")
        .description("batch creates new tasks in the journal")
        .argument("<actions...>")
        .option("-g, --group <group>", "which group the tasks belong to, e.g. bug, feature")
        .action((actions: string[], options) => $journal.importThen(
            journal => {
                const version  = $.version(journal.version);
                const group = options.group;

                if (!(version in journal.tasks))
                    journal.tasks[version] = [];

                journal.tasks[version].push(
                    ...actions.map(action => $jot.task(action, version, group)));

                $journal.write(journal);
            }, `Failed to create tasks: [${actions.join()}]`
        ));
}

export const uncheck_ = (cmd: Command) => {
    cmd.command("uncheck")
        .description("unchecks tasks marked done")
        .argument("<indices...>")
        .action((indices: string[]) => $journal.importThen(
            journal => indices.forEach(index => $jot.check(parseInt(index), journal, false)),
            `Failed to uncheck tasks: [${indices.join()}]`
        ));
}