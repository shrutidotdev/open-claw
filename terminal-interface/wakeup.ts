import { select, isCancel } from "@clack/prompts"
import chalk from "chalk";
import figlet from "figlet";

const BANNER_FONT = 'ANSI Shadow';
const CYBERPUNK_NEON = chalk.hex('#0ff').bold;           
const HACKER_GREEN = chalk.hex('#00FF00');           
const WARNING_RED = chalk.bgRed.white.bold;

export const wokeUp = async () => {

    let ascii: string;
    try {
        ascii = figlet.textSync('Open Claw', { font: BANNER_FONT})
        console.log(CYBERPUNK_NEON(ascii))
    } catch (error) {
        ascii = figlet.textSync('Open Claw', {font: "Standard"})
        console.log(ascii)
    }
}