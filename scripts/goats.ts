#!/usr/bin/env node
import * as program from "commander";
import { Tasks } from "./services/Tasks";

program
    .version("0.0.1");

program
    .command("init <baseRepo>")
    .option("-b, --branch <name>", "the name of the branch to checkout")
    .description("initialize the repositories")
    .action((baseRepo, option) => Tasks.cloneRepos(baseRepo, option.branch));

program
    .command("refresh")
    .description("Performs a pull on all the repositories")
    .action(() => Tasks.refreshRepos());

program
    .command("*")
    .action(() => program.help());

program.parse(process.argv);

if (!program.args.length) program.help();