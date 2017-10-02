import * as fs from "fs-extra";
import {Git} from "./Git";
import {Settings} from "./Settings";

export class Feature {
    static start(destFolder: string, name: string) {
        let featureFile: string = destFolder + "/feature.lock";
        let git: Git = new Git(Settings.folder);
        git.checkout(destFolder, "master");
        git.pull(destFolder);

        if (!fs.existsSync(featureFile)) {
            fs.createFileSync(featureFile);
        }
        fs.appendFileSync(featureFile, `[FEATURE] ${name} - Start at ${new Date().toDateString()} \n`);

        git.createBranch(destFolder, name);
        git.add(destFolder, "feature.lock");
        git.commit(destFolder, `Start feature ${name}`);
        git.push(destFolder, "origin", name);
    }

    static finish(destFolder: string, name: string) {
        let git: Git = new Git(Settings.folder);
        git.checkout(destFolder, name);
        git.pull(destFolder);

        git.checkout(destFolder, "master");
        git.merge(destFolder, name);
        git.push(destFolder, "origin", "master");
        git.deleteBranch(destFolder, name);
    }
}