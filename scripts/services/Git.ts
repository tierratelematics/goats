import * as fs from "fs";
import * as path from "path";
let spawn = require("smart-spawn");

export class Git {
    constructor(private baseRepo: string) { }

    clone(name: string, destFolder: string, branch?: string): Promise<any> {
        branch = branch || "master";

        return new Promise((resolve, reject) => {
            let url = this.baseRepo.split("/").slice(0, -1).join("/") + "/" + name;
            fs.access(destFolder, err => {
                let targetDir = destFolder.split(path.sep).slice(0, -1).join(path.sep);
                if (err)
                    reject(err);
                else
                    spawn("git", ["clone", "--quiet", "--branch", branch, url, destFolder], targetDir, e => {
                        if (e)
                            reject(e);
                        resolve();
                    });
            });
        });
    }

    pull(folder: string): Promise<any> {
        return new Promise((resolve, reject) => {
            spawn("git", ["fetch", "--quiet", "--all"], folder, err => {
                if (err) reject(err);
                else
                    resolve();

                spawn("git", ["merge", "--quiet", "--ff-only"], folder, e => {
                    if (e) reject(e);
                    else
                        resolve();
                });
            });
        });
    }

    checkout(folder: string, branch: string): Promise<any> {
        return new Promise((resolve, reject) => {
            spawn("git", ["checkout", "--quiet", branch], folder, err => {
                if (err) reject(err);
                else
                    resolve();
            });
        });
    }
}
