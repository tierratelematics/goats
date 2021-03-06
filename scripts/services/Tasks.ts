import * as fs from "fs-extra";
import * as path from "path";
import {Git} from "./Git";
import {Settings} from "./Settings";
import * as _ from "lodash";
import * as shell from "shelljs";
import {Module} from "./Module";
import {Feature} from "./Feature";
import {Npm} from "./Npm";
import {colorize, LogTextColor} from "./LogUtils";

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
        Settings.generateRushFile();
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
        let branchCheckout: String;

        for (let item of Settings.config.projects) {
            try {
                branchCheckout = await git.checkout(Settings.folder + "/" + item.projectFolder, branch);
                console.log(`- Repository ${item.packageName} checked out to ${branchCheckout}.`);
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
                shell.exec(command + " " + parameters.join(" "), {cwd: destFolder});
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
        let packageFile = fs.readJsonSync(path.join(externalPath, "package.json"), {encoding: "utf-8"});
        let dependencies = _.concat(
            _.keys(packageFile.dependencies),
            _.keys(packageFile.devDependencies),
            _.keys(packageFile.peerDependencies),
            _.keys(packageFile.otherDependencies));

        console.log("- Reading modules version...");
        let modulePath = path.join(externalPath, "node_modules");

        let packages = _.map(dependencies, packagePath => {
            try {
                let file = fs.readJsonSync(path.join(modulePath, packagePath, "package.json"), {encoding: "utf-8"});
                return {name: file.name, version: file.version};
            } catch (e) {
                return;
            }
        }).filter(f => f !== undefined)
            .reduce((prev, current) => {
                prev[current.name] = {version: current.version};
                return prev;
            }, {});

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

    static async gitFlowFeatureCommands(action: string, name: string, projects: String[]) {
        console.log("");
        console.log(`${action} the ${name} feature inside projects ${projects.join(" ")}...`);
        let configProjectsList = (action === "start") ?
            _.intersectionWith(Settings.config.projects, projects, (config: any, project) => config.packageName === project) :
            Settings.config.projects;

        let git = new Git(Settings.repository);
        for (let item of configProjectsList) {
            try {
                let destFolder: string = Settings.folder + "/" + item.projectFolder;
                if (action === "start") {
                    console.log(`- Start on ${item.packageName} done.`);
                    Feature.start(destFolder, name);
                }
                else if (action === "finish" && git.hasBranch(destFolder, name)) {
                    console.log(`- Finish on ${item.packageName} done.`);
                    Feature.finish(destFolder, name);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async packageModuleReplaceVersionCommand(name: string, version: string) {
        console.log("");
        console.log(`Replace the new version ${version} of the module ${name} ...`);

        let module = new Module(name, version);

        for (let item of Settings.nodeProjects) {
            try {
                let packageDict = require(`${Settings.folder}/${item.projectFolder}/package.json`);
                packageDict.dependencies = module.replaceVersionInside(packageDict.dependencies);
                packageDict.optionalDependencies = module.replaceVersionInside(packageDict.optionalDependencies);
                packageDict.devDependencies = module.replaceVersionInside(packageDict.devDependencies);
                packageDict.peerDependencies = module.replaceVersionInside(packageDict.peerDependencies);

                fs.writeFileSync(`${Settings.folder}/${item.projectFolder}/package.json`, JSON.stringify(packageDict, null, 4));
                console.log(`- Run on ${item.packageName} done.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async diffCommand(baseBranch: string, showChanges: boolean) {
        console.log("");
        console.log(`Show differences between current branch and ${baseBranch} ...`);

        let git = new Git(Settings.repository);

        for (let item of Settings.config.projects) {
            try {
                let folder = `${Settings.folder}/${item.projectFolder}`;
                let currentBranch: string = git.currentBranch(folder);
                let changes: string = git.diff(folder, currentBranch, baseBranch);
                if (!showChanges) {
                    console.log(`[${item.packageName}] ${currentBranch} is ${changes !== "" ? "NOT" : ""} merged with ${baseBranch}`);
                }
                else {
                    console.log(`[${item.packageName}] ${(changes === "") ? "NO" : ""} changes ${changes} \n ---------`);
                }

            } catch (err) {
                console.error(err);
            }
        }
    }

    static async infoCommand(projectName: string, last: boolean, check: boolean) {
        console.log("");
        console.log(`Check versions...`);

        let projects = (projectName) ? [{
            projectFolder: `modules/${projectName}`,
            packageName: projectName
        }] : Settings.nodeProjects;

        for (let item of projects) {
            try {
                let module = new Module(item.packageName, "", item.projectFolder);
                console.log(`[${item.packageName}] version: ${module.getVersion((check) ? true : last)}`);

                if (check) {
                    let resultCheck = module.sameVersion();
                    if (!resultCheck.result)
                        console.warn(`[${item.packageName}] version (${resultCheck.versions.npm}) different to last git tag (${resultCheck.versions.git})`);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async packageModuleVersionCommand(name: string) {
        console.log("");
        console.log(`Check the version of the module ${name} ...`);

        for (let item of Settings.nodeProjects) {
            try {
                let packageDict = require(`${Settings.folder}/${item.projectFolder}/package.json`);
                let modules = _.merge(packageDict.dependencies, packageDict.optionalDependencies,
                    packageDict.devDependencies, packageDict.peerDependencies);

                console.log(`[${item.packageName}] ${name}: ${modules[name] ? modules[name] : "Not found"}`);
            } catch (err) {
                console.error(err);
            }

        }
    }

    static async numberFindCommitsCommand(target: string) {
        console.log("");
        console.log(`Retrieve the number of commit with the target ${target}...`);

        let git = new Git(Settings.repository);

        for (let item of Settings.nodeProjects) {
            try {
                let numberCommit = await git.numberCommit(Settings.folder + "/" + item.projectFolder, target);
                console.log(`[${item.packageName}] Number commit: ${numberCommit}`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async test() {
        console.log("");
        console.log("Running test...");

        let npm = new Npm();
        for (let item of Settings.nodeProjects) {
            try {
                let resultText = npm.run("test", Settings.folder + "/" + item.projectFolder).code === 0
                    ? colorize("OK", LogTextColor.GREEN)
                    : colorize("KO", LogTextColor.RED);

                console.log(`Running on ${item.packageName} with result: ${resultText}`);

            } catch (err) {
                console.error(err);
            }
        }
    }
}
