import * as path from "path";
import * as fs from "fs";

export class Rush {
    public static readonly instance = new Rush();

    public baseDir: string;
    public config: any;

    private constructor() {
        let current = process.cwd();

        for (let i = 0; i < 10; ++i) {
            const configFile = path.join(current, "rush.json");

            if (fs.existsSync(configFile)) {
                if (i > 0)
                    console.log("Found configuration in " + configFile);
                this.baseDir = path.dirname(configFile);
                this.config = JSON.parse(fs.readFileSync(configFile, "utf8"));
                return;
            }

            const parent = path.dirname(current);
            if (parent === current) break;

            current = parent;
        }
        throw new Error("Unable to find rush.json configuration file");
    }
}
