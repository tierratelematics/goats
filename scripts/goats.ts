#!/usr/bin/env node
import * as program from "commander";
import {Tasks} from "./services/Tasks";
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
    .action(branch => {
        return Tasks.checkoutRepos(branch);
    });

program
    .command("run <cmd> [params...]")
    .description("Runs a command on all the repositories")
    .action((name, params) => {
        return Tasks.runCommand(name, params);
    });

program
    .command("link <folder>")
    .option("-i, --ignore", "ignores the version for every package")
    .description("Links the specified folder as an external library")
    .action((folder, option) => {
        return Tasks.linkFolder(folder, option.ignore || false);
    });

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
    .command("info")
    .description("Show versions list for each repository")
    .option("-p, --project <project>", "retrieve the version only for the <project>")
    .option("-l, --last", "retrieve only the last version")
    .option("-c, --check", "compare git tag with project tag")
    .action((option) => Tasks.infoCommand(option.project, !!(option.last), !!(option.check)));

program
    .command("find-commits <target>")
    .description("Number of commit for each repository with specific target")
    .action((target) => Tasks.numberFindCommitsCommand(target));

program
    .command("feature <action> <name> [projects...]")
    .alias("ft")
    .description("Run a feature's command in the projects declared")
    .action((action, name, projects) => {
        return Tasks.gitFlowFeatureCommands(action, name, projects);
    });

program
    .command("module <name>")
    .option("-r, --replace [version]", "replace the version of the module")
    .description("Retrieve the version of a module for every repository")
    .action((name, option) => {
        if (option.replace)
            return Tasks.packageModuleReplaceVersionCommand(name, option.replace);
        else
            return Tasks.packageModuleVersionCommand(name);
    });

program
    .command("diff <baseBranch>")
    .option("--show-changes", "Show the changes")
    .description("Display the changes between current branch and baseBranch")
    .action((baseBranch, option) => {
        return Tasks.diffCommand(baseBranch, !!(option.showChanges));
    });

program
    .command("test")
    .description("Run tests for every node project")
    .action(() => {
        return Tasks.test();
    });

program
    .command("*")
    .action(() => program.help());

program.parse(process.argv);

if (!program.args.length) program.help();