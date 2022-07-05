import {Command} from "commander";
import * as journal from "./cmds/journal";
import * as jot from "./cmds/jot";

export class CLI {

    static journal(): Command {
        const cmd = new Command()
            .name("jot-vm:journal - \"version journaling\"")
            .description("Lightweight cli for locally tracking versions and tasks")
            .version("0.1.0");

        journal.init_(cmd);
        journal.clear_(cmd);
        journal.delete_(cmd);
        journal.next_(cmd);
        journal.revert_(cmd);
        journal.status_(cmd);
        journal.tasks_(cmd);
        journal.usage_(cmd);

        return cmd;
    }

    static jot(): Command {
        const cmd = new Command()
            .name("jot-vm:jot - \"version task management\" tool")
            .description("Lightweight cli for locally tracking versions and tasks")
            .version("0.1.0");

        jot.task_(cmd);
        jot.tasks_(cmd);
        jot.check_(cmd);
        jot.delete_(cmd);
        jot.finish_(cmd);
        jot.move_(cmd);
        jot.uncheck_(cmd);
        jot.status_(cmd);

        return cmd;
    }
}