import * as path from "path";
import * as shell from "shelljs";

export class Git {
    constructor(private baseRepo: string) {
    }

    clone(name: string, destFolder: string, branch?: string) {
        branch = branch || "master";
        let url = this.baseRepo.split("/").slice(0, -1).join("/") + "/" + name;
        let targetDir = destFolder.split(path.sep).slice(0, -1).join(path.sep);
        shell.exec(`git clone --quiet --branch ${branch} ${url} ${destFolder}`, {cwd: targetDir});
    }

    pull(folder: string) {
        shell.exec(`git fetch --quiet --all`, {cwd: folder});
        shell.exec(`git merge --quiet --ff-only`, {cwd: folder});
    }

    checkout(folder: string, branch: string) {
        shell.exec(`git checkout --quiet ${branch}`, {cwd: folder});
    }

    push(folder: string, ...options: string[]) {
        shell.exec(`git push ${options.join(" ")}`, {cwd: folder});
    }

    currentBranch(folder: string): string {
        return shell.exec("git rev-parse --abbrev-ref HEAD", {cwd: folder, silent: true}).stdout.toString().trim();
    }

    numberCommit(folder: string, target: string) {
        return shell.exec(`git log | egrep "${target}" | wc -l`, {
            cwd: folder,
            silent: true
        }).stdout.toString().trim();
    }
}
