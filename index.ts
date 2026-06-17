#!/usr/bin/env bun 
import { Command } from "commander";
import { wokeUp } from "./terminal-interface/wakeup";

const program = new Command();

program
    .name("open-claw")
    .description("An autonomous AI CLI agent built from scratch using Bun and TypeScript.")
    .version("0.0.1");
    
program
    .command("wakeup")
    .description("Show the banner and pick cli or telegram node")
    .action(async() => {
        console.log("🤖 Welcome to Open-Claw!")
        await wokeUp();
    });

await program.parseAsync(process.argv);