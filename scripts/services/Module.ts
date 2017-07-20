import {Dictionary} from "lodash";

export class Module {
    private name: string;
    private version: string;

    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
    }

    public replaceVersionInside(dependencies: Dictionary<string>): Dictionary<string> {
        if (dependencies && dependencies[this.name])
            dependencies[this.name] = this.version;

        return dependencies;
    }
}
