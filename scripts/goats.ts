#!/usr/bin/env node
import * as program from "commander";
import { Tasks } from "./services/Tasks";
import * as shell from "shelljs";

let packageJson = require("../package.json");

program
    .version(packageJson.version);

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
    .command("checkout <branch>")
    .description("Checks out the repositories to a specific branch")
    .action(branch => { return Tasks.checkoutRepos(branch); });

program
    .command("run <cmd> [params...]")
    .description("Runs a command on all the repositories")
    .action((name, params) => { return Tasks.runCommand(name, params); });

program
    .command("link <folder>")
    .option("-i, --ignore", "ignores the version for every package")
    .description("Links the specified folder as an external library")
    .action((folder, option) => { return Tasks.linkFolder(folder, option.ignore || false); });

program
    .command("rebuild [params...]")
    .description("Runs the rush rebuild command")
    .action(params => shell.exec("rush rebuild " + params.join(" ")));

program
    .command("install [params...]")
    .description("Runs the rush install command")
    .action(params => {
        shell.exec("rush install " + params.join(" "));
        console.log("You might want to run `goats link` for any external library you had");
    });

program
    .command("generate [params...]")
    .description("Runs the rush generte command")
    .action(params => {
        shell.exec("rush generate " + params.join(" "));
        console.log("You might want to run `goats link` for any external library you had");
    });


program
    .command("feature <action> <name>")
    .alias("ft")
    .description("Run a feature's command in all the repositories")
    .action((action, name) => { return Tasks.gitFlowFeatureCommands(action, name); });

program
    .command("module <name>")
    .description("Retrieve the version of a module for every repository")
    .action((name) => { return Tasks.moduleVersionCommand(name); });

program
    .command("*")
    .action(() => program.help());

program.parse(process.argv);

if (!program.args.length) program.help();