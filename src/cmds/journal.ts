import chalk from "chalk";
import * as fs from "fs";
import {Argument, Command} from "commander";
import {$cmn as $, $journal, JOURNAL_JSON, USAGE} from "./cmn";

export const clear_ = (cmd: Command): void => {
    cmd.command("clear")
        .description("deletes all tasks in the current version")
        .action(() => $journal.importThen(
            journal => {
                const version = $.version(journal.version);

                if (version in journal.tasks)
                    delete journal.tasks[version];

                $journal.write(journal);
            },
            `Failed to delete tasks`));
}

export const delete_ = (cmd: Command): void => {
    cmd.command("delete")
        .description("deletes the journal in the given directory")
        .action(() => {
            fs.unlink(JOURNAL_JSON, _ => { });
        });
}

export const init_ = (cmd: Command): void => {
    cmd.command("init")
        .description("initializes a new journal with the give name")
        .argument("<name>", "journal name")
        .option("-v, --version <version>", "initial version of journal")
        .option("-t, --tag <tag>", "tag for initial version")
        .option("-o, --overwrite", "overwrites existing file")
        .action((name: string, options) => {
            fs.access(JOURNAL_JSON, fs.constants.F_OK, error => {
                if (error || options.overwrite) {
                    const [version, tag] = [options.version, options.tag];
                    const journal = $journal.init(name.trim(), version, tag);
                    $journal.write(journal);
                }
            });
        });
}

export const next_ = (cmd: Command): void => {
    cmd.command("next")
        .description("moves project to next version, defaults to build")
        .addArgument(new Argument("<part>", "which part of the version to increment")
            .choices(["patch", "minor", "major"]))
        .option("-t, --tag <focus>", "tag for build")
        .action((part, options) => $journal.importThen(
            journal => $journal.next(journal, $.versionIndex[part], options),
            "Failed to update version"));
}

export const status_ = (cmd: Command): void => {
    cmd.command("status")
        .description("Current version of the journal and task completion states.")
        .action(() => $journal.importThen(
            journal => {
                const version = $.version(journal.version);
                console.log(chalk.bold.blue(version));

                if (!!journal.tag)
                    console.log(chalk.italic(journal.tag));

                const tasks = $journal.tasks(journal, version)
                console.log(`Total tasks: ${tasks.length}`);

                if (tasks.length > 0) {
                    const done = tasks.filter(([_, task]) => !!task.done).length;
                    console.log(`  Incomplete: ${chalk.red(tasks.length - done)}`);
                    console.log(`  Complete: ${chalk.green(done)}`);
                }

            }, "Failed to get status"));
}

export const tasks_ = (cmd: Command): void => {
    cmd.command("tasks")
        .description("all tasks in the journal for a given version")
        .option("-v, --version <version>", "which version of tasks to get")
        .option("-d, --done", "gets only completed tasks")
        .option("--no-done", "gets only incomplete tasks")
        .action(options => $journal.importThen(
            journal => {
                if (options.version === ".")
                    options.version = $.version(journal.version);

                if (options.version === "..")
                    options.version = Object.keys(journal.versions).at(-2) ?? "0.0.0";

                console.log($journal.tasklist(
                    journal, options.version, options.done).join("\n"))
            },
            "Failed to get tasks"));
}

export const revert_ = (cmd: Command): void => {
    cmd.command("revert")
        .description("reverts the journal to the previous version")
        .action(() => $journal.importThen(
            journal => {
                const versions = Object.keys(journal.versions);
                const lastVersion = versions.at(-1) ?? "0.0.0";
                const revertVersion = versions.at(-2) ?? "0.0.0";
                const tag = revertVersion in journal.tags ? journal.tags[revertVersion] : "";

                if (versions.length > 0)
                    delete journal.versions[lastVersion];

                if (lastVersion in journal.tags)
                    delete journal.tags[lastVersion];

                journal.version = $.parseVersion(revertVersion);
                journal.tag = tag;

                $journal.write(journal);
            }
        ));
}

export const usage_ = (cmd: Command): void => {
    cmd.command("usage")
        .description("quick start for using the cli")
        .action(() => console.log(USAGE))
}