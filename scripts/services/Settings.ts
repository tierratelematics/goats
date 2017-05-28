import * as fs from "fs";
import { Rush } from "./Rush";

export class Settings {
    static get repository() {
        return fs.readFileSync(this.folder + "/.goats-config", "utf-8");
    };

    static set repository(value: string) {
        fs.writeFileSync(this.folder + "/.goats-config", value, { encoding: "utf-8" });
    }

    static get config() {
        return Rush.instance.config;
    }

    static get folder() {
        return Rush.instance.baseDir;
    }
}