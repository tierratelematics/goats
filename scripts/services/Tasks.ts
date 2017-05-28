import * as fs from "fs";
import * as mkdirp from "mkdirp";
import { Git } from "./Git";
import { Settings } from "./Settings";
let spawn = require("smart-spawn");

export class Tasks {
    static async cloneRepos(baseRepo: string, branch?: string) {
        console.log("");
        console.log("Cloning repos...");

        let git = new Git(baseRepo);

        for (let item of Settings.config.projects) {
            let path = Settings.folder + "/" + item.projectFolder;
            if (fs.existsSync(path))
                continue;
            console.log("- Creating folder " + item.projectFolder);
            mkdirp.sync(path);
            try {
                await git.clone(item.packageName + ".git", path, branch);
                console.log(`- Repository ${item.packageName} cloned.`);
            } catch (err) {
                console.error(err);
            }
        }
        Settings.repository = baseRepo;
    }

    static async refreshRepos() {
        console.log("");
        console.log("Refreshing repos...");

        let git = new Git(Settings.repository);

        for (let item of Settings.config.projects) {
            try {
                await git.pull(Settings.folder + "/" + item.projectFolder);
                console.log(`- Repository ${item.packageName} pulled.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async checkoutRepos(branch: string) {
        console.log("");
        console.log(`Checkout repos to ${branch}...`);

        let git = new Git(Settings.repository);

        for (let item of Settings.config.projects) {
            try {
                await git.checkout(Settings.folder + "/" + item.projectFolder, branch);
                console.log(`- Repository ${item.packageName} checked out to ${branch}.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async runCommand(command: string, ...parameters: string[]) {
        console.log("");
        console.log(`Running ${command}...`);

        for (let item of Settings.config.projects) {
            try {
                let destFolder = Settings.folder + "/" + item.projectFolder;
                fs.access(destFolder, err => {
                    if (err)
                        throw err;
                    else
                        spawn(command, parameters[0], destFolder, e => {
                            if (e)
                                throw e;
                        });
                });
                console.log(`- Run on ${item.packageName} done.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

}
