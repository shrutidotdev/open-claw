import {isCancel, text} from "@clack/prompts";
import chalk from "chalk";

export async function runAgentMode(agent: any){
    console.log(chalk.greenBright("\n🤖 Welcome to Open Claw Agent Mode!"));

    const goal = await text({
        message: "Please enter your goal for the AI agent:",
        placeholder: "e.g write a blog post about AI...",
    })

    if(isCancel(goal) || !goal.trim()){
        console.log(chalk.red("\nExisting Open Claw. Goodbye!"));
        process.exit(0);
    }

    const config = defaultAgentCongif();
    const tracker = new ActionTracker();
}