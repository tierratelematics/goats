import * as fs from "fs";
import * as mkdirp from "mkdirp";
import { Git } from "./Git";
import { Settings } from "./Settings";

export class Tasks {
    static async cloneRepos(baseRepo: string, branch?: string) {
        console.log("");
        console.log("Cloning repos...");

        let git = new Git(baseRepo);

        for (let item of Settings.config.file.projects) {
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

        for (let item of Settings.config.file.projects) {
            try {
                await git.pull(Settings.config.baseDir + "/" + item.projectFolder);
                console.log(`- Repository ${item.packageName} pulled.`);
            } catch (err) {
                console.error(err);
            }
        }
    }
}