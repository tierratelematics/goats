import * as shell from "shelljs";

export class Npm {
    constructor() {}

    version(module: string, last: boolean): string {
        let versionOption = (last) ? "version" : "versions";
        return shell.exec(`npm view ${module} ${versionOption}`, {
            silent: true
        }).stdout.toString().trim();
    }

    run(name: string, target: string): any {
        return shell.exec(`npm run ${name}`, {cwd: target, silent: true});
    }
}
