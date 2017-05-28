import * as path from "path";
import * as fs from "fs";

export class Rush {
    public static readonly instance = new Rush();

    public baseDir: string;
    public config: any;

    private constructor() {
        let current = process.cwd();

        for (let i = 0; i < 10; ++i) {
            const config = path.join(current, "rush.json");

            if (fs.existsSync(config)) {
                if (i > 0)
                    console.log("Found configuration in " + config);
                this.baseDir = path.dirname(config);
                this.config = JSON.parse(fs.readFileSync(config, "utf8"));
            }

            const parent = path.dirname(current);
            if (parent === current) break;

            current = parent;
        }
        throw new Error("Unable to find rush.json configuration file");
    }
}
