import {isCancel, text} from "@clack/prompts";
import chalk from "chalk";
import { defaultAgentConfig } from "./types";
import { ActionTracker } from "./action-tracker";
import { ToolExecutor } from "./tool-executor";

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

    const config = defaultAgentConfig();
    const tracker = new ActionTracker();
    const executor = new ToolExecutor(tracker, config);
    const tools = createAge
}