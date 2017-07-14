import * as fs from "fs-extra";
import * as path from "path";
import { Git } from "./Git";
import { Settings } from "./Settings";
import * as _ from "lodash";
import * as shell from "shelljs";

export class Tasks {
    static async cloneRepos(baseRepo: string, branch?: string) {
        console.log("");
        console.log("Cloning repos...");

        let git = new Git(baseRepo);

        for (let item of Settings.config.projects) {
            let path = Settings.folder + "/" + item.projectFolder;
            console.log("- Creating folder " + item.projectFolder);
            shell.mkdir("-p", path);
            try {
                await git.clone(item.packageName + ".git", path, branch);
                console.log(`- Repository ${item.packageName} cloned.`);
            } catch (err) {
                console.error(err);
            }
        }
        Settings.repository = baseRepo;
    }

    static async refreshRepos() {
        console.log("");
        console.log("Refreshing repos...");

        let git = new Git(Settings.repository);

        for (let item of Settings.config.projects) {
            try {
                await git.pull(Settings.folder + "/" + item.projectFolder);
                console.log(`- Repository ${item.packageName} pulled.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async checkoutRepos(branch: string) {
        console.log("");
        console.log(`Checkout repos to ${branch}...`);

        let git = new Git(Settings.repository);

        for (let item of Settings.config.projects) {
            try {
                await git.checkout(Settings.folder + "/" + item.projectFolder, branch);
                console.log(`- Repository ${item.packageName} checked out to ${branch}.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async runCommand(command: string, parameters: string[]) {
        console.log("");
        console.log(`Running ${command}...`);

        for (let item of Settings.config.projects) {
            try {
                let destFolder = Settings.folder + "/" + item.projectFolder;
                shell.exec(command + " " + parameters.join(" "), { cwd: destFolder });
                console.log(`- Run on ${item.packageName} done.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async linkFolder(folder: string, ignoreVersions: boolean) {
        console.log("");
        console.log(`Linking ${folder} with ${ignoreVersions ? "NO version check" : "version check"}...`);

        let externalPath = path.join(process.cwd(), folder);
        let packageFile = fs.readJsonSync(path.join(externalPath, "package.json"), { encoding: "utf-8" });
        let dependencies = _.concat(
            _.keys(packageFile.dependencies),
            _.keys(packageFile.devDependencies),
            _.keys(packageFile.peerDependencies),
            _.keys(packageFile.otherDependencies));

        console.log("- Reading modules version...");
        let modulePath = path.join(externalPath, "node_modules");

        let packages = _.map(dependencies, packagePath => {
            try {
                let file = fs.readJsonSync(path.join(modulePath, packagePath, "package.json"), { encoding: "utf-8" });
                return { name: file.name, version: file.version };
            } catch (e) { return; }
        }).filter(f => f !== undefined)
            .reduce((prev, current) => { prev[current.name] = { version: current.version }; return prev; }, {});

        let shrinkwrap = fs.readJsonSync(path.join(Settings.folder, "common/config/rush/npm-shrinkwrap.json")).dependencies;

        let shared = _.intersection(
            _.keys(packages),
            _.keys(shrinkwrap)
        );

        shared.forEach(library => {
            if (ignoreVersions || shrinkwrap[library].version === packages[library].version) {
                console.log(`- Linking ${library}...`);
                shell.rm("-rf", path.join(externalPath, "node_modules", library));
                shell.ln(
                    "-sf",
                    path.join(Settings.folder, "common/temp/node_modules", library),
                    path.join(externalPath, "node_modules", library)
                );
            }
        });
        console.log(`Linking ${packageFile.name}...`);
        shell.rm("-rf", path.join(Settings.folder, "common/temp/node_modules", packageFile.name));
        shell.ln("-sf", externalPath, path.join(Settings.folder, "common/temp/node_modules", packageFile.name));
        console.log("Done. You might want to run 'goats rebuild'.");
    }

    static async gitFlowFeatureCommands(action: string, name: string) {
        console.log("");
        console.log(`${action} the ${name} feature...`);

        if (_.startsWith(name, "feature"))
            throw new Error("The name must not start with feature");

        let git = new Git(Settings.repository);

        for (let item of Settings.config.projects) {
            try {
                let destFolder: string = Settings.folder + "/" + item.projectFolder;
                shell.exec(`git flow feature ${action} ${name}`, { cwd: destFolder });
                if (action === "start") {
                    await git.push(destFolder, "origin", `feature/${name}`);
                }
                console.log(`- Run on ${item.packageName} done.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async moduleVersionCommand(name: string) {
        console.log("");
        console.log(`Check the version of the module ${name} ...`);

        for (let item of Settings.config.projects) {
            try {
                let packageDict = require(`${Settings.folder}/${item.projectFolder}/package.json`);
                let modules = _.merge(packageDict.dependencies, packageDict.optionalDependencies, packageDict.devDependencies);

                console.log(`[${item.packageName}] ${name}: ${modules[name] ? modules[name] : "Not found"}`);
            } catch (err) {
                console.error(err);
            }
        }
    }
}
