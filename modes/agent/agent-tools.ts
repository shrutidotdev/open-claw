import { tool } from 'ai';
import { z } from 'zod';
import type { ToolExecutor } from './tool-executor.ts';
import { path } from '@clack/prompts';

export function createAgentTools(executor: ToolExecutor) {
    return {
        // Read Only 
        read_file: tool({
            description: 'Read a text file from the workspace. Use a path relative to the project root.',
            inputSchema: z.object({
                path: z.string().describe('Relative file path.')
            }),
            execute: async ({ path: p }) => executor.readFile(p)
        }),

        // list files under the directory
        list_files: tool({
            description: 'List files and directories under a path.',
            inputSchema: z.object({
                path: z.string(),
                recursive: z.boolean().optional().default(false),
            }),
            execute: async ({ path: p, recursive }) => {
                executor.listFiles(p, recursive)
            }
        })

        // search file
        search_files: tool({
            description: 'Find files matching a glob pattern (e.g. "*.ts", "**/*.md"). Optional content substring filter.',
            inputSchema: z.object({
                root: z.string().describe('Directory to search, relative to root'),
                pattern: z.string().describe('Glob pattern using * and **'),
                content_contains: z.string().optional(),
            }),
            execute: async ({ root, pattern, content_contains }) =>
                executor.searchFiles(root, pattern, content_contains),
        }),

        analyze_codebase: tool({
            description: 'Summarize structure: file counts, sizes, extensions. Read-only.',
            inputSchema: z.object({
                path: z.string().default('.')
            }),
            execute: async ({ path: p }) =>
                executor.analyzeCodeBase(p)

        })

    }
}