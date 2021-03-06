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

    checkout(folder: string, branch: string): string {
        branch = this.hasBranch(folder, branch) ? branch : "master";
        shell.exec(`git checkout --quiet ${branch}`, {cwd: folder});
        return branch;
    }

    push(folder: string, ...options: string[]) {
        shell.exec(`git push ${options.join(" ")}`, {cwd: folder});
    }

    commit(folder: string, message: string) {
        shell.exec(`git commit -a -m "${message}"`, {cwd: folder});
    }

    currentBranch(folder: string): string {
        return shell.exec("git rev-parse --abbrev-ref HEAD", {cwd: folder, silent: true}).stdout.toString().trim();
    }

    lastTag(folder: string): string {
        return shell.exec("git describe --abbrev=0 --tags", {cwd: folder, silent: true}).stdout.toString().trim();
    }

    numberCommit(folder: string, target: string) {
        return shell.exec(`git log | egrep "${target}" | wc -l`, {
            cwd: folder,
            silent: true
        }).stdout.toString().trim();
    }

    createBranch(folder: string, branchName: string) {
        if (this.hasBranch(folder, branchName)) {
            this.checkout(folder, branchName);
            return;
        }

        this.checkout(folder, "master");
        this.pull(folder);

        shell.exec(`git checkout -b ${branchName}`, {cwd: folder});
        this.push(folder, "origin", branchName);
    }


    merge(folder: string, branchName: string) {
        shell.exec(`git merge origin ${branchName}`, {cwd: folder});
    }

    add(folder: string, fileName: string) {
        shell.exec(`git add ${fileName}`, {cwd: folder});
    }

    deleteBranch(folder: string, branchName: string) {
        shell.exec(`git branch -d ${branchName}`, {cwd: folder});
        shell.exec(`git push origin --delete ${branchName}`, {cwd: folder});
    }

    hasBranch(folder: string, branchName: string): boolean {
        shell.exec(`git fetch --quiet --all`, {cwd: folder});
        return shell.exec(`git branch -a | egrep ${branchName} | wc -l`, {cwd: folder, silent: true})
            .stdout.toString().trim() !== "0";
    }

    headTag(folder: string): string {
        return shell.exec(`git tag --contains HEAD`, {cwd: folder, silent: true}).stdout.toString().trim();
    }

    diff(folder: string, branchToCompare: string, baseBranch: string): string {
        shell.exec(`git fetch --quiet --all`, {cwd: folder, silent: true});
        return shell.exec(`git diff ${branchToCompare} origin ${baseBranch}`, {
            cwd: folder,
            silent: true
        }).stdout.toString().trim();
    }
}
