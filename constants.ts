import { ExecException, exec } from "child_process";

class Shell {
    static async write(text: string | any): Promise<string> {
        return await new Promise((resolve): void => {
            process.stdout.write(text.toString());
            resolve(text.toString());
        })
    }

    static async run(command: string = 'ls', after?: (stderr: ExecException | null, stdout: string) => any): Promise<string> {
        return await new Promise((resolve): void => {
            exec(command, (stderr, stdout): void => {
                after?.(stderr, stdout);
                resolve(stdout);
            });
        });
    }

    static async runSilently(command: string = 'ls', after = (stderr: ExecException | null, stdout: string): void => {}): Promise<string> {
        return await new Promise((resolve): void => {
            const finalCommand: string = command.includes('&')
                ? command.split('&')[0] + '> /dev/null ' + "&" + command.split('&')[1]
                : command + ' > /dev/null'

            exec(finalCommand, (stderr, stdout): void => {
                after(stderr, stdout);
                resolve(stdout);
            });
        });
    }
};

class Colors {
    RED: string = '\x1b[91m';
    GREEN: string = '\x1b[92m';
    BLUE: string = '\x1b[94m';
    PINK: string = '\x1b[95m';
    CYAN: string = '\x1b[96m';
    ENDC: string = '\x1b[0m';
};

class Divider extends Colors {
    length: number;
    constructor(length: number) {
        super();
        this.length = length
    }

    async logDivider(): Promise<void> {
        await Shell.write(`${this.PINK}-${this.CYAN}~`.repeat(this.length) + '\n' + this.ENDC)
    }
};

class States extends Colors {
    PENDING;
    FAILURE;
    SUCCESS;
    constructor() {
        super();
        this.PENDING = `${this.PINK}[${this.CYAN}*${this.PINK}]${this.ENDC}`
        this.FAILURE = `${this.PINK}[${this.CYAN}-${this.PINK}]${this.RED}`
        this.SUCCESS = `${this.PINK}[${this.CYAN}+${this.PINK}]${this.GREEN}`
    }
}

class Constants {
    static IPA_FETCH_LINK = "https://cdn.discordapp.com/attachments/1015971724895989780/1135321133143572611/Discord_190.0_47131.ipa";
}

export { Shell, Colors, Divider, States, Constants };

