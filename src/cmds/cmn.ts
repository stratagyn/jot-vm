import {writeFile} from "fs";
import chalk from "chalk";

import type {Journal, Task} from "./types";

export const JOURNAL_JSON = `${process.cwd()}/.journal.json`;

export const USAGE = `
______________________________________
     (_)___   / /        _  __  __ _
____/ // _ \\/ __//_____| |/ /_/  ' \\
 __/ / \\___/\\__/      |___/ /_/_/_/
|___/_________________________________ 

> journal init "usage" 

intializes a new '.journal.json' file in the current working directory if it does not
exist.  If it does exist, the '-o' or '--overwrite' option would be used to forcefully
initialize a new journal.

> journal status

outputs the current version of the journal, the tag, and a list of current tasks, if any.

0.0.0

> journal init "usage" -ov "0.1.0" -t "initial relase"


0.1.0
initial relase

> journal next patch 

increments the chosen part of the version, this can be "major", "minor" or "patch", with
an optional tag given by the "-t" or "--tag" option.

0.1.1

> jot task "+forced upgrade with incomplete tasks" -g "feature"
> jot tasks "+group movement for tasks" "+version movement for tasks" -g "feature"

adds tasks to the current version of the journal in an optionally specified group.

> journal tasks

outputs all tasks in the journal

1 [ ] +forced upgrade with incomplete tasks
2 [ ] +group movement for tasks
3 [ ] +version movement for tasks

> jot check 2 

checks the task at the given 1-based index.

> journal tasks -d

2 [✓] +group movement for tasks

> journal tasks --no-done

1 [ ] +forced upgrade with incomplete tasks
3 [ ] +version movement for tasks

> jot status 1 2

gets information about specified tasks

Task: [1] +group movement for tasks
Group: feature
Created: 6/29/2022 15:07:15 GMT
Version: 0.1.1
Done: 6/29/2022 15:07:16 GMT

Task: [2] +version movement for tasks
Group: feature
Created: 6/29/2022 15:07:15 GMT
Version: 0.1.1
Done: false

> jot uncheck 2 

marks a complete task as incomplete

1 [ ] +forced upgrade with incomplete tasks
2 [ ] +group movement for tasks
3 [ ] +version movement for tasks

> journal next patch

incrementing a journal version before finishing all tasks of this version will fail

No upgrade with incomplete tasks!

1 [ ] +forced upgrade with incomplete tasks
2 [ ] +group movement for tasks
3 [ ] +version movement for tasks

> jot finish 

marks all incomplete tasks as complete

1 [✓] +forced upgrade with incomplete tasks
2 [✓] +group movement for tasks
3 [✓] +version movement for tasks

now incrementing the patch version will work

0.1.2

> journal tasks -v 0.1.1

gets the tasks of a specific version \`.\` and \`..\` can be used for the current and previous
versions, respectively. If no version is indicated, all tasks in the journal are printed.

1 [✓] +forced upgrade with incomplete tasks
2 [✓] +group movement for tasks
3 [✓] +version movement for tasks

> journal revert 

will revert the journal to it's last version. this is the same as undoing \`journal next ...\`

0.1.1
1 [✓] +forced upgrade with incomplete tasks
2 [✓] +group movement for tasks
3 [✓] +version movement for tasks

> journal delete 

will delete the journal in the current working directory`

export module $cmn {

    export const errorMessage = (prefix: string, source: any): string => {
        const msg = source?.message ? `: ${source.message}` : "";
        return `${prefix}${msg}`;
    }

    export const localeGMTDate = (
        locales?: string | string[],
        options?: Intl.DateTimeFormatOptions): string => {

        const date = new Date();
        const localeDate = date.toLocaleDateString(locales, options);
        const parsedDate = date.toUTCString().split(":", 3);
        const gmt = `${parsedDate[0].slice(-2).trim()}:${parsedDate[1]}:${parsedDate[2]}`;
        return `${localeDate} ${gmt}`;
    }

    export const parseVersion = (v: string): [major: number, minor: number, patch: number] =>
        v.split(".", 3).map(p => parseInt(p)) as [number, number, number];

    export const version =(v: [major: number, minor: number, patch: number]) =>
        `${v[0]}.${v[1]}.${v[2]}`;

    export const versionIndex: { [key: string]: 0 | 1 | 2 } = {
        major: 0,
        minor: 1,
        patch: 2
    }
}

export module $journal {
    export const currentTasks = (journal: Journal): Task[] => {
        const version = $cmn.version(journal.version);

        if (version in journal.tasks)
            return journal.tasks[version];

        return [];
    }

    export const init = (name: string, version?: string, tag?: string): Journal => {
        version = version?.trim() || "0.0.0";
        tag = tag?.trim() || "";

        return {
            name: name,
            version: [...$cmn.parseVersion(version)],
            lastBuild: "",
            tag: tag,
            tags: !!tag ? Object.fromEntries([[version, tag]]) : {},
            tasks: {},
            versions: !!tag ? Object.fromEntries([[version, tag]]) : {}
        };
    }

    export const next = (journal: Journal, vIndex: 0 | 1 | 2, options: any): void => {
        const version = $cmn.version(journal.version);
        const incomplete = tasklist(journal, version, false);

        if (incomplete.length > 0) {
            console.log(chalk.red.bold("No upgrade with incomplete tasks!\n"));
            console.log(incomplete.join("\n"));
            return;
        }

        journal.version[vIndex] += 1;

        for (let i = vIndex + 1; i < 3; i++)
            journal.version[i] = 0;

        const nextVersion =  $cmn.version(journal.version);
        const tag = options.tag?.trim() ?? "";
        const tags = Object.keys(journal.tags);
        const lastTag = tags.length > 0 ? journal.tags[tags.at(-1)!] : "";

        if (tag && tag != lastTag)
            journal.tags[nextVersion] = tag;

        journal.tag = tag;
        journal.lastBuild = $cmn.localeGMTDate();
        journal.versions[nextVersion] = journal.lastBuild;

        write(journal);
    }

    export const tasks = (journal: Journal, version?: string, done?: boolean): [number, Task][] => {
        const taskVersions = Object.keys(journal.tasks);

        if (taskVersions.length === 0 || (version && !(version in journal.tasks)))
            return [];

        let indexedTasks: [number, Task][] =
            version
                ? journal.tasks[version].map((task, i) => [i + 1, task])
                : Object.keys(journal.tasks).sort((v1, v2) => {
                    const [major1, minor1, patch1] = $cmn.parseVersion(v1);
                    const [major2, minor2, patch2] = $cmn.parseVersion(v2);

                    return (major1 - major2) || (minor1 - minor2) || (patch1 - patch2);
                }).map(key => journal.tasks[key]).flat().map((task, i) => [i + 1, task]);

        if (done != undefined)
            indexedTasks = indexedTasks.filter(([_, task]) => !!task.done === done);

        return indexedTasks;
    }

    export const tasklist = (journal: Journal, version?: string, done?: boolean): string[] =>
        tasks(journal, version, done).map(([index, task]) => {
            const done = `${index} [${task.done ? '\u2713' : " "}]`;
            return `${done} ${(task.done ? chalk.green : chalk.red)(task.action)}`;
        });

    export const write = (journal: any): void =>
        writeFile(JOURNAL_JSON, JSON.stringify(journal, null, 4), error => {
            if (error)
                console.error($cmn.errorMessage("Failed to write file", error));
        });

    export const readThen = async (f: (journal: Journal) => void, errorMessage: string = ""):
        Promise<void> => {
        try {
            import(JOURNAL_JSON).then(journal => f({...journal}));
        } catch (error) {
            console.error($cmn.errorMessage(errorMessage || "Failed to read file", error));
        }
    }
}

export module $jot {
    export const check = (index: number, journal: Journal, checked: boolean = true) => {
        const task = taskat(index, journal);

        if (task) {
            const done = "done" in task;

        if (!checked && done)
            delete task.done;

        if (checked && !done)
            task.done = $cmn.localeGMTDate();

        $journal.write(journal);
        }
    }

    export const gather = (task: Task, i: number, version: string, options: any) => {
        const details = [`Task: [${i}] ${(task.done ? chalk.green : chalk.red)(task.action)}`];
        const getDetail = Object.keys(options).length === 0;

        if (options.group || getDetail)
            details.push(`Group: ${task.group || ""}`);

        if (options.created || getDetail)
            details.push(`Created: ${task.created}`);

        if (options.version || getDetail)
            details.push(`Version: ${version}`);

        if (options.status || getDetail)
            details.push(`Done: ${task.done || false}`);

        return details;
    }

    export const task = (action: string, version: string, group?: string): Task => {
        return {
            action: action.trim(),
            group: group || "",
            created: $cmn.localeGMTDate()
        }
    }

    const taskat = (index: number, journal: Journal): Task | undefined =>
        $journal.currentTasks(journal).at(index - 1);
}