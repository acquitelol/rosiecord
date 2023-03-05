/**
* -~-~-~ Main Rosiecord Patch Script -~-~-~
* Build to Patch Enmity, Icons, Fonts, and Other Tweaks into the Base Discord IPA.
* Created by Rosie "Acquite" on Thursday 22st December 2022.
* Required Dependencies: PLUTIL, LOCAL_DIRS[Fonts, Icons, Enmity_Patches{Required, Optional}], AZULE
*/
import { exec } from 'child_process';
import fs from 'fs';
import Constants from './constants.js';
const { Colors, FORMAT, IPA_FETCH_LINK, GET_PATCH_TYPE } = Constants;
const GLOBAL_DIST_DIR = GET_PATCH_TYPE((accessor) => process.argv[2] === accessor, "k2genmity", "Dist_K2genmity", "Dist", "Unused_Deb");
class States extends Colors {
    constructor() {
        super();
        this.PENDING = `${this.PINK}[${this.CYAN}*${this.PINK}]${this.ENDC}`;
        this.FAILURE = `${this.PINK}[${this.CYAN}-${this.PINK}]${this.RED}`;
        this.SUCCESS = `${this.PINK}[${this.CYAN}+${this.PINK}]${this.GREEN}`;
    }
}
class Shell {
    static async write(text) {
        return await new Promise((resolve) => {
            process.stdout.write(text.toString());
            resolve(text.toString());
        });
    }
    static async run(command = 'ls', after = (stderr, stdout) => { }) {
        return await new Promise((resolve) => {
            exec(command, (stderr, stdout) => {
                after(stderr, stdout);
                resolve(stdout);
            });
        });
    }
    static async runSilently(command = 'ls', after = (stderr, stdout) => { }) {
        return await new Promise((resolve) => {
            const finalCommand = command.includes('&')
                ? command.split('&')[0] + '> /dev/null ' + "&" + command.split('&')[1]
                : command + ' > /dev/null';
            exec(finalCommand, (stderr, stdout) => {
                after(stderr, stdout);
                resolve(stdout);
            });
        });
    }
}
class Main extends Colors {
    constructor(type, outputType) {
        super();
        this.type = type;
        this.outputType = outputType;
    }
    format(item, type) {
        return `${this.PINK}[${this.CYAN}${item.state === 'pending'
            ? '*'
            : item.state === 'success'
                ? '+'
                : '-'}${this.PINK}]${item.state === 'pending'
            ? this.CYAN
            : item.state === 'success'
                ? this.GREEN
                : this.RED} ${item.name} ${type}`;
    }
    load(path) {
        return JSON.parse(fs.readFileSync(path).toString());
    }
    async get(item) {
        const ipaArray = [];
        await Shell.run(item, (_, stdout) => {
            stdout.split('\n').filter(ipa => ipa !== "").forEach(ipa => ipaArray.push(ipa));
        });
        return ipaArray;
    }
    async logCurrentState(ipaStates, type) {
        const defaultStates = ipaStates.map(ipaItem => this.format(ipaItem, this.type));
        const stdout = `${this.BLUE}${type}: [${this.PINK}${defaultStates.join(`${this.CYAN}, ${this.PINK}`)}${this.BLUE}]${this.ENDC}\r`;
        await Shell.write('\r'.repeat(stdout.length));
        await Shell.write(stdout);
    }
    async Main(callable) {
        await callable();
        await Shell.write(`\n${this.GREEN}All ${this.PINK}Base IPAs${this.GREEN} have been successfully packaged with ${this.PINK}${this.outputType}${this.GREEN}. ${this.CYAN}Continuing to the next step...${this.ENDC}\n`);
    }
}
class State {
    constructor(state, name) {
        this.state = state;
        this.name = name;
    }
}
class Inject extends Colors {
    constructor(type, outputType, hasClean, getParam) {
        super();
        this.type = type;
        this.outputType = outputType;
        this.hasClean = hasClean;
        this.getParam = getParam;
    }
    async run(M, callable) {
        const requiredPatches = (await M.get(this.getParam)).filter(item => {
            if (!this.hasClean)
                return true;
            return process.argv[2] == "k2genmity"
                ? (item !== (item.includes("Development")
                    ? "Enmity.Development.Official.deb"
                    : "Enmity.deb"))
                : (item !== "K2genmity.Development.deb");
        });
        const stdoutIpas = await M.get(`ls ${GLOBAL_DIST_DIR}`);
        const tweakStates = requiredPatches.map(ipa => new State('pending', ipa));
        const S = new States();
        await Shell.write(`${this.CYAN}Injecting ${this.PINK}${this.outputType}${this.CYAN} into ${this.PINK}Base IPAs${this.CYAN}. If ${this.hasClean ? "a " : ""}${this.PINK}${this.type}${this.CYAN} has been ${this.GREEN}successfully${this.CYAN} injected in all IPAs, it will look like this: ${this.BLUE}"${S.SUCCESS} ${this.hasClean ? `Example ` : ""}${this.type}${this.BLUE}"\n`);
        await M.logCurrentState(tweakStates, `Injected ${this.type}${this.hasClean ? "s" : ""}`);
        for (const i in requiredPatches) {
            let patched = 0;
            for (const j in stdoutIpas) {
                const ipaName = stdoutIpas[j].split('.')[0];
                const patchName = requiredPatches[i];
                await callable(ipaName, patchName);
                patched++;
                const isComplete = patched === stdoutIpas.length;
                // @ts-ignore
                isComplete ? tweakStates.find(patch => patch.name === patchName).state = 'success' : null;
                isComplete ? await M.logCurrentState(tweakStates, `Injected ${this.type}s`) : null;
            }
        }
    }
}
const EntryPoint = async (index, ipaName) => {
    switch (index) {
        case 0: {
            const M = new Main('IPA', "Different Fonts");
            await M.Main(async () => {
                const ipaList = ['GGSans', ...await M.get('ls Fonts/woff2')];
                const ipaStates = ipaList.map(ipa => new State('pending', ipa));
                await Shell.write(`${M.CYAN}Packaging the ${M.PINK}Base IPAs${M.CYAN}. If an ${M.PINK}IPA${M.CYAN} has been ${M.GREEN}successfully${M.CYAN} packaged, it will look like this: ${M.BLUE}"${M.PINK}[${M.CYAN}+${M.PINK}]${M.GREEN} Example IPA${M.BLUE}"\n`);
                await M.logCurrentState(ipaStates, "Base Font IPAs");
                await Shell.runSilently(`zip -q -r ${GLOBAL_DIST_DIR}/Rosiecord_GGSans-Font.ipa Payload & wait $!`, async (stderr, _) => {
                    ipaStates[0].state = stderr ? 'failure' : 'success';
                    await M.logCurrentState(ipaStates, 'Base Font IPAs');
                });
                await Shell.runSilently(`rm -rf Payload & wait $!`);
                for (const Font of ipaList.filter(ipa => ipa !== 'GGSans')) {
                    await Shell.runSilently(`unzip -qq -o ${GLOBAL_DIST_DIR}/Rosiecord-${ipaName.split("_")[1]}_GGSans-Font.ipa`);
                    await Shell.runSilently(`cp -rf Fonts/woff2/${Font}/* Payload/Discord.app/`);
                    await Shell.runSilently(`zip -q -r ${GLOBAL_DIST_DIR}/Rosiecord-${ipaName.split("_")[1]}_${Font}-Font.ipa Payload & wait $!`);
                    await Shell.runSilently(`rm -rf Payload & wait $!`);
                    // @ts-ignore
                    ipaStates.find(ipa => ipa.name === Font).state = 'success';
                    await M.logCurrentState(ipaStates, "Base Font IPAs");
                }
            });
            break;
        }
        case 1: {
            const M = new Main('Tweak', 'Required Tweaks');
            await M.Main(async () => {
                await new Inject("Tweak", "all Required Tweaks", true, 'ls Enmity_Patches/Required').run(M, async (ipaName, patchName) => {
                    await Shell.runSilently(`Azule/azule -i ${GLOBAL_DIST_DIR}/${ipaName}.ipa -o ${GLOBAL_DIST_DIR} -f Enmity_Patches/Required/${patchName} & wait $!`);
                    await Shell.runSilently(`mv ${GLOBAL_DIST_DIR}/${ipaName}+${patchName}.ipa ${GLOBAL_DIST_DIR}/${ipaName}.ipa`);
                });
            });
            break;
        }
        case 2: {
            const M = new Main('Pack', 'Icon Packs');
            await M.Main(async () => {
                await new Inject("Pack", "all Icon Packs", true, 'ls Packs').run(M, async (ipaName, patchName) => {
                    await Shell.run(`unzip -qq -o ${GLOBAL_DIST_DIR}/${ipaName}.ipa`);
                    await Shell.runSilently(`cp -rf Packs/${patchName}/* Payload/Discord.app/assets/`);
                    await Shell.runSilently(`zip -q -r ${GLOBAL_DIST_DIR}/${ipaName}+${patchName}_Icons.ipa Payload`);
                    await Shell.runSilently(`rm -rf Payload`);
                });
            });
            break;
        }
        case 3: {
            const M = new Main('Tweak', "Optional Variations");
            await M.Main(async () => {
                await new Inject("Flowercord", 'Flowercord', false, "ls Enmity_Patches/Optional").run(M, async (ipaName, patchName) => {
                    await Shell.runSilently(`Azule/azule -i ${GLOBAL_DIST_DIR}/${ipaName}.ipa -o ${GLOBAL_DIST_DIR} -f Enmity_Patches/Optional/${patchName} & wait $!`);
                    await Shell.runSilently(`mv ${GLOBAL_DIST_DIR}/${ipaName}+${patchName}.ipa ${GLOBAL_DIST_DIR}/${ipaName}+Flowercord.ipa`);
                });
            });
            break;
        }
        default:
            break;
    }
};
class Divider extends Colors {
    constructor(length) {
        super();
        this.length = length;
    }
    async logDivider() {
        await Shell.write(`${this.PINK}-${this.CYAN}~`.repeat(this.length) + '\n' + this.ENDC);
    }
}
class Initialiser extends States {
    async PackageTweak(tweakName, cmd, permanentability) {
        await Shell.write(`${this.PENDING}${this.PINK} Packaging ${this.CYAN}"${this.PINK}${tweakName}${this.CYAN}"${this.PINK}. ${this.BLUE}This may take a while...${this.ENDC}\r`);
        process.chdir(`Tweaks/${tweakName}`);
        await Shell.runSilently(`rm -rf packages`);
        await Shell.run(cmd, async (stderr) => {
            await Shell.write(stderr
                ? `${this.FAILURE} An error occured while packaging ${this.PINK}"${this.CYAN}${tweakName}${this.PINK}"${this.RED}.${this.ENDC}\n`
                : `${this.SUCCESS} Successfully installed ${this.PINK}"${this.CYAN}${tweakName}${this.PINK}"${this.GREEN} into ${this.PINK}"${this.CYAN}./Enmity_Patches/${permanentability}/${this.PINK}"${this.GREEN}.${this.ENDC}\n`);
        });
        await Shell.runSilently(`mv packages/$(find packages "*.deb") ../Enmity_Patches/${permanentability}/${tweakName}.deb`);
        process.chdir('../..');
    }
    async InitializeAzule() {
        fs.existsSync('Azule')
            ? await Shell.write(`${this.SUCCESS}${this.PINK} Azule${this.GREEN} already exists in ${this.PINK}"${this.CYAN}./${this.PINK}"${this.GREEN}...${this.ENDC}\n`)
            : await (async () => {
                await Shell.write(`${this.PENDING}${this.PINK} Installing ${this.CYAN}"Azule"${this.PINK}. ${this.BLUE}This may take a while...${this.ENDC}\r`);
                await Shell.run(`git clone https://github.com/Al4ise/Azule/ & wait $!`, async (stderr, stdout) => {
                    await Shell.write(stderr
                        ? `${this.FAILURE} An error occured while installing ${this.PINK}"${this.CYAN}Azule${this.PINK}"${this.RED}.${this.ENDC}\n`
                        : `${this.SUCCESS} Successfully installed ${this.PINK}"${this.CYAN}Azule${this.PINK}"${this.GREEN} into ${this.PINK}"${this.CYAN}./${this.PINK}"${this.GREEN}.${this.ENDC}\n`);
                    await Shell.write(stdout);
                });
            })();
    }
}
const main = async () => {
    const START_TIME = Date.now();
    const M = new Main("Entry", "Entry in file");
    const S = new States();
    const D = new Divider(25);
    const Init = new Initialiser();
    const { version } = M.load('./package.json');
    const IPA_LINK = IPA_FETCH_LINK;
    const IPA_NAME = IPA_LINK.split('/')[6].split(".")[0]; // Gets just the IPA Name, "Discord_158" or whatever
    await D.logDivider();
    await Shell.write(`${M.PINK} █▀█ █▀█ █▀ █ █▀▀ █▀▀ █▀█ █▀█ █▀▄\n${M.CYAN} █▀▄ █▄█ ▄█ █ ██▄ █▄▄ █▄█ █▀▄ █▄▀${M.ENDC}\n`);
    await Shell.write(`${M.PINK}A project written by ${M.CYAN}Rosie${M.BLUE}/${M.CYAN}Acquite${M.ENDC}\n`);
    await Shell.write(`${M.BLUE}This patcher is on version ${M.PINK}"${M.CYAN}${version}${M.PINK}"${M.ENDC}\n`);
    await Shell.write(`${M.BLUE}Patching Discord Version ${M.PINK}"${M.CYAN}${IPA_NAME}${M.PINK}"${M.ENDC}\n`);
    await D.logDivider();
    await Shell.write(`${S.PENDING}${M.CYAN} Clearing existing ${M.PINK}\"IPAs\"${M.CYAN} in ${M.PINK}\"./${GLOBAL_DIST_DIR}\".${M.ENDC}\r`);
    await Shell.runSilently(`mkdir -p ${GLOBAL_DIST_DIR}/ & wait $!; rm -rf ${GLOBAL_DIST_DIR}/* & wait $!; rm -rf Payload & wait $!`, (stderr) => {
        Shell.write(stderr
            ? `${S.FAILURE} An error occurred while clearing existing ${M.PINK}\"IPAs\" in ${M.PINK}\"./${GLOBAL_DIST_DIR}\".${M.ENDC}\n`
            : `${S.SUCCESS} Successfully cleared existing ${M.PINK}\"IPAs\"${M.GREEN} in ${M.PINK}\"./${GLOBAL_DIST_DIR}\".${M.ENDC}\n`);
    });
    await Shell.write(`${S.PENDING}${M.CYAN} Downloading ${M.PINK}\"${IPA_NAME}.ipa\"${M.CYAN} into ${M.PINK}\"./Ipas\".${M.ENDC}\r`);
    await Shell.runSilently(`mkdir Ipas; rm -rf Ipas/* & wait $!;`);
    await Shell.runSilently(`curl ${IPA_LINK} -o Ipas/${IPA_NAME}.ipa`, (stderr) => {
        Shell.write(stderr
            ? `${S.FAILURE} An error occurred while downloading ${M.PINK}\"${IPA_NAME}.ipa\" into ${M.PINK}\"./Ipas\".${M.ENDC}\n`
            : `${S.SUCCESS} Successfully downloaded ${M.PINK}\"${IPA_NAME}.ipa\"${M.GREEN} into ${M.PINK}\"./Ipas\".${M.ENDC}\n`);
    });
    const IPA_DIR = `Ipas/${IPA_NAME}.ipa`;
    await Shell.write(`${S.SUCCESS} Directory of IPA: ${M.PINK}${IPA_DIR}${M.ENDC}\n`);
    await Shell.write(`${S.PENDING}${M.CYAN} Unzipping ${M.PINK}\"${IPA_DIR}\"${M.CYAN} into ${M.PINK}\"./Payload\".${M.ENDC}\r`);
    await Shell.runSilently(`unzip -o ${IPA_DIR} & wait $!`, (stderr) => {
        Shell.write(stderr
            ? `${S.FAILURE} An error occurred while unzipping ${M.PINK}\"${IPA_DIR}\".${M.ENDC}\n`
            : `${S.SUCCESS} Successfully unzipped ${M.PINK}\"${IPA_DIR}\"${M.GREEN} into ${M.PINK}\"./Payload\".${M.ENDC}\n`);
    });
    await D.logDivider();
    const MAIN_PLIST = `Payload/Discord.app/Info.plist`;
    const name = "Rosiecord";
    await Shell.write(`${S.PENDING}${M.CYAN} Replacing Discord's Name To ${M.PINK}\"${name}\".${M.ENDC}\r`);
    await Shell.runSilently(`plutil -replace CFBundleName -string "${name}" ${MAIN_PLIST} & wait $!`);
    await Shell.runSilently(`plutil -replace CFBundleDisplayName -string "Rosiecord" ${MAIN_PLIST} & wait $!`, (stderr) => {
        Shell.write(stderr
            ? `${S.FAILURE} An error occurred while Replacing ${M.PINK}\"Discord's Name\".${M.ENDC}\n`
            : `${S.SUCCESS} Successfully Replaced ${M.PINK}\"Discord's Name\"${M.GREEN} to ${M.PINK}\"${name}\".${M.ENDC}\n`);
    });
    await Shell.write(`${S.PENDING}${M.CYAN} Patching Discord's URL Scheme To ${M.PINK}\"Add Enmity's URL Handler\".${M.ENDC}\r`);
    await Shell.runSilently(`plutil -insert CFBundleURLTypes.1 -xml "<dict><key>CFBundleURLName</key><string>Enmity</string><key>CFBundleURLSchemes</key><array><string>enmity</string></array></dict>" ${MAIN_PLIST} & wait $!`, (stderr) => {
        Shell.write(stderr
            ? `${S.FAILURE} An error occurred while Patching ${M.PINK}\"Discord's URL Scheme\".${M.ENDC}\n`
            : `${S.SUCCESS} Successfully Patched ${M.PINK}\"Discord's URL Scheme\"${M.GREEN} to ${M.PINK}\./Add Enmity's URL Handler\".${M.ENDC}\n`);
    });
    await Shell.write(`${S.PENDING}${M.CYAN} Removing Discord's ${M.PINK}\"Supported Device Limits\"${M.CYAN}.${M.ENDC}\r`);
    await Shell.runSilently(`plutil -remove UISupportedDevices ${MAIN_PLIST} & wait $!`, (stderr) => {
        Shell.write(stderr
            ? `${S.FAILURE} An error occurred while removing Discord's ${M.PINK}\"Supported Device Limits\"${M.RED}.${M.ENDC}\n`
            : `${S.SUCCESS} Successfully Removed Discord's ${M.PINK}\"Supported Device Limits\"${M.GREEN}.${M.ENDC}\n`);
    });
    await Shell.write(`${S.PENDING}${M.CYAN} Patching ${M.PINK}\"Discord's Icons\" ${M.CYAN} to ${M.PINK}\"Enmity's Icons\"${M.CYAN}.${M.ENDC}\r`);
    await Shell.runSilently(`cp -rf Icons/* Payload/Discord.app/`);
    await Shell.runSilently(`plutil -replace CFBundleIcons -xml "<dict><key>CFBundlePrimaryIcon</key><dict><key>CFBundleIconFiles</key><array><string>EnmityIcon60x60</string></array><key>CFBundleIconName</key><string>EnmityIcon</string></dict></dict>" ${MAIN_PLIST} & wait $!`);
    await Shell.runSilently(`plutil -replace CFBundleIcons~ipad -xml "<dict><key>CFBundlePrimaryIcon</key><dict><key>CFBundleIconFiles</key><array><string>EnmityIcon60x60</string><string>EnmityIcon76x76</string></array><key>CFBundleIconName</key><string>EnmityIcon</string></dict></dict>" ${MAIN_PLIST} & wait $!`, (stderr) => {
        Shell.write(stderr
            ? `${S.FAILURE} An error occurred while removing Discord's ${M.PINK}\"Supported Device Limits\"${M.RED}.${M.ENDC}\n`
            : `${S.SUCCESS} Successfully Patched ${M.PINK}\"Discord's Icons\"${M.GREEN} to ${M.PINK}\"Enmity's Icons\"${M.GREEN}.${M.ENDC}\n`);
    });
    await Shell.write(`${S.PENDING}${M.CYAN} Enabling ${M.PINK}\"UISupportsDocumentBrowser\"${M.CYAN} and ${M.PINK}\"UIFileSharingEnabled\"${M.CYAN}.${M.ENDC}\r`);
    await Shell.run(`plutil -replace UISupportsDocumentBrowser -bool true ${MAIN_PLIST} & wait $!`);
    await Shell.run(`plutil -replace UIFileSharingEnabled -bool true ${MAIN_PLIST} & wait $!`, (stderr) => {
        Shell.write(stderr
            ? `${S.FAILURE} An error occurred while Enabling ${M.PINK}\"UISupportsDocumentBrowser\"${M.RED} and ${M.PINK}\"UIFileSharingEnabled\"${M.RED}.${M.ENDC}\n`
            : `${S.SUCCESS} Successfully Enabled ${M.PINK}\"UISupportsDocumentBrowser\"${M.GREEN} and ${M.PINK}\"UIFileSharingEnabled\"${M.GREEN}.${M.ENDC}\n`);
    });
    if (process.argv[2] == "k2genmity") {
        await Shell.write(`${S.PENDING}${M.CYAN} Modifying ${M.PINK}\"NSFaceIDUsageDescription\"${M.CYAN} and adding ${M.PINK}\"K2genmity\"${M.CYAN}.${M.ENDC}\r`);
        await Shell.run(`plutil -replace NSFaceIDUsageDescription -string "K2genmity" ${MAIN_PLIST} & wait $!`, (stderr) => {
            Shell.write(stderr
                ? `${S.FAILURE} An error occurred while modifying ${M.PINK}\"NSFaceIDUsageDescription\"${M.RED}.${M.ENDC}\n`
                : `${S.SUCCESS} Successfully modified ${M.PINK}\"NSFaceIDUsageDescription\"${M.GREEN} and added ${M.PINK}\"K2genmity\"${M.GREEN}.${M.ENDC}\n`);
        });
    }
    await D.logDivider();
    await Init.PackageTweak("Enmity", "yarn build", "Required");
    await Init.PackageTweak("Flowercord", "gmake package", "Optional");
    await Init.InitializeAzule();
    await D.logDivider();
    for (let i = 0; i <= 3; i++) {
        await EntryPoint(i, IPA_NAME);
        await D.logDivider();
        // await new Promise((resolve) => setTimeout(() => resolve(), 2000));
    }
    const END_TIME = Date.now();
    await Shell.write(`${S.SUCCESS} Successfully built ${M.PINK}Rosiecord${M.GREEN} in ${M.CYAN}${(END_TIME - START_TIME) / 1000} seconds${M.GREEN}.`);
};
await main();
