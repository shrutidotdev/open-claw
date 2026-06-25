import { isCancel, text } from "@clack/prompts";
import chalk from "chalk";
import { defaultAgentConfig } from "./types";
import { ActionTracker } from "./action-tracker";
import { ToolExecutor } from "./tool-executor";
import { ToolLoopAgent, stepCountIs } from 'ai';
import { createAgentTools } from "./agent-tools";
import { getAgentMode, getAgentModel } from "../../ai/ai.config";
import { renderMarkdownToTerminal } from "../../terminal-interface/terminal";

export async function runAgentMode(): Promise<void> {
    console.log(chalk.greenBright("\n🤖 Welcome to Open Claw Agent Mode!"));

    const goal = await text({
        message: "What would you like the agent to do?",
        placeholder: "e.g write a blog post about AI...",
    })

    if (isCancel(goal) || !goal.trim()) {
        console.log(chalk.red("\nExisting Open Claw. Goodbye!"));
        process.exit(0);
    }

    const config = defaultAgentConfig();
    const tracker = new ActionTracker();
    const executor = new ToolExecutor(config, tracker);
    const tools = createAgentTools(executor);

    const agent = new ToolLoopAgent({
        model: getAgentModel(),
        stopWhen: stepCountIs(40),
        instructions: [
            `Workspace root: ${config.codebasePath}`,
            'All mutations are staged until approval.',
        ].join('\n'),
        tools,
    });

    const result = await agent.generate({
        prompt: goal.trim(),
        onStepFinish: ({ toolcalls }) => {
            for(const tc of toolcalls) {
                const preview = JSON.stringify(tc.input).slice(0, 160);
                console.log(
                    chalk.green('  ✓'),
                    chalk.bold(String(tc.toolName)),
                    chalk.dim(preview + (preview.length >= 160 ? '…' : '')),               
                )
            }
        }
    });

    if(result.text?.trim()) console.log(renderMarkdownToTerminal(result.text))
    const ok = await 
}