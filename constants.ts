export default {
    IPA_FETCH_LINK: "https://cdn.discordapp.com/attachments/986937851042213888/1120979519382245457/Discord_183.0.ipa",
    ENMITY_LOADER: "Enmity.Debug.deb",
    GET_PATCH_TYPE<T, V>(predicate: Function, inputArg: V, truePredicate: T, falsePredicate: T, fallback: T): T {
        const out: boolean = predicate(inputArg);
        switch(out) {
            case true: return truePredicate
            case false: return falsePredicate
            default: return fallback;
        }
    },
    FORMAT(someInput: string) {
        return someInput.split(" ").map((e: string) => e[0].toUpperCase() + e.slice(1)).join(' ').replace(" ", "").replace(".deb", "")
    },
    Colors: class {
        RED: string = '\x1b[91m';
        GREEN: string = '\x1b[92m';
        BLUE: string = '\x1b[94m';
        PINK: string = '\x1b[95m';
        CYAN: string = '\x1b[96m';
        ENDC: string = '\x1b[0m';
    }
}