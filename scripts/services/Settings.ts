import * as fs from "fs";
import {Project} from "./Project";
import {filter, assign} from "lodash";
import * as path from "path";

export class Settings {
    static nodeRepositories: any;

    static get repository() {
        return fs.readFileSync(this.folder + "/.goats-config", "utf-8");
    }

    static set repository(value: string) {
        fs.writeFileSync(this.folder + "/.goats-config", value, {encoding: "utf-8"});
    }

    static get config() {
        return Project.instance.config;
    }

    static get nodeProjects() {
        if (!this.nodeRepositories) {
            this.nodeRepositories = filter(Project.instance.config.projects, (project: { projectFolder: string, packageName: string }) => {
                return fs.existsSync(path.join(Project.instance.baseDir, project.projectFolder, "package.json"));
            });
        }
        return this.nodeRepositories;
    }

    static get folder() {
        return Project.instance.baseDir;
    }

    static generateRushFile() {
        fs.writeFileSync(path.join(this.folder, "rush.json"), JSON.stringify(assign(this.config, {projects: this.nodeProjects}), null, 2), {encoding: "utf-8"});
    }
}
