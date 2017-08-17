import {Dictionary} from "lodash";
import {Npm} from "./Npm";
import {Git} from "./Git";
import {Settings} from "./Settings";

export class Module {
    private name: string;
    private version: string;
    private folder: string;

    constructor(name: string, version: string, folder?: string) {
        this.name = name;
        this.version = version;
        this.folder = folder;
    }

    public replaceVersionInside(dependencies: Dictionary<string>): Dictionary<string> {
        if (dependencies && dependencies[this.name])
            dependencies[this.name] = this.version;

        return dependencies;
    }

    public getVersion(last: boolean): string {
        return new Npm().version(this.name, last);
    }

    public sameVersion(): {result: boolean, versions: {git: string, npm: string}} {
        let npmVersion = this.getVersion(true);
        let gitTag = new Git(Settings.repository).lastTag(Settings.folder + "/" + this.folder);
        return {result: npmVersion === gitTag, versions: {git: gitTag, npm: npmVersion}};
    };
}
