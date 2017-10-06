import {Git} from "./Git";
import {Settings} from "./Settings";

export class Feature {
    static start(destFolder: string, name: string) {
        let git: Git = new Git(Settings.folder);
        git.checkout(destFolder, "master");
        git.pull(destFolder);

        git.createBranch(destFolder, name);
    }

    static finish(destFolder: string, name: string) {
        let git: Git = new Git(Settings.folder);
        let storyId: string = name.split("-")[1];

        git.checkout(destFolder, name);
        git.pull(destFolder);

        let headTag: string = git.headTag(destFolder);
        if (headTag && headTag.split(".")[1] === storyId) {
            git.checkout(destFolder, "master");
            git.merge(destFolder, name);
            git.push(destFolder, "origin", "master");
            git.deleteBranch(destFolder, name);
        }
        else
            console.error("[ERROR] Head not contains a valid tag");
    }
}
