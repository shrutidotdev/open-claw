import { select, isCancel } from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";

const BANNER_FONT = "ANSI Shadow";
const CYBERPUNK_NEON = chalk.hex("#0ff").bold;
const FACE = chalk.hex("#ECF8DC").bold;

function printBanner(ascii: string) {
  const lines = ascii.trimEnd().split("\n");
  const width = Math.max(...lines.map((l) => l.length), 0) + 2;

  process.stdout.write(`\x1b[${lines.length}A`);

  for (const line of lines) {
    console.log(FACE(line.padEnd(width)));
  }
  console.log();
}

export const wokeUp = async () => {
  let ascii: string;
  try {
    ascii = figlet.textSync("Open Claw", { font: BANNER_FONT });
  } catch (error) {
    ascii = figlet.textSync("Open Claw", { font: "Standard" });
  }
  printBanner(ascii);

  const mode = await select({
    message: "Which mode you want to select?",
    options: [
      {
        value: "Cli",
        label: "CLI",
      },
      {
        value: "telegram",
        label: "Telegram"
      }
    ],
  });

  if(isCancel(mode)){
    console.log(chalk.red("\nExisting Open Claw. Goodbye!"));
    process.exit(0);
  }

  console.log(CYBERPUNK_NEON(`\nStarting project in ${mode} mode...`));
};
