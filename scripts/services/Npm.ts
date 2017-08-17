import * as path from "path";
import * as shell from "shelljs";

export class Npm {
    constructor() {}

    version(module: string, last: boolean): string {
        let versionOption = (last) ? "version" : "versions";
        return shell.exec(`npm view ${module} ${versionOption}`, {
            silent: true
        }).stdout.toString().trim();
    }
}
