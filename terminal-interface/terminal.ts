import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

let ready = false;

export function initializeTerminalRenderer() {
    if (ready) return;

    const w = Math.max(40, Math.min(process.stdout.columns || 80, 120));
    const terminalRenderer = markedTerminal({ width: w }) as any;
    marked.use({ renderer: terminalRenderer });
    ready = true;

}

export function renderMarkdownToTerminal(md: string): string {
    initializeTerminalRenderer();

    return marked.parse(md.trimEnd(), { async: false }) as string;
}