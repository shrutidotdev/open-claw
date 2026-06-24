import { tool } from 'ai';
import { z } from 'zod';
import type { ToolExecutor } from './tool-executor.ts';

// In-memory scratchpad — lives for the duration of one agent session
const scratchpad = new Map<string, string>();

export function createAgentTools(executor: ToolExecutor) {
    return {

        // ─── READ ONLY ────────────────────────────────────────────────

        read_file: tool({
            description:
                'Read a text file from the workspace. Use a path relative to the project root.',
            inputSchema: z.object({
                path: z.string().describe('Relative file path'),
            }),
            execute: async ({ path: p }) => executor.readFile(p),
        }),

        list_files: tool({
            description: 'List files and directories under a path.',
            inputSchema: z.object({
                path: z.string(),
                recursive: z.boolean().optional().default(false),
            }),
            execute: async ({ path: p, recursive }) =>
                executor.listFiles(p, recursive),
        }),

        search_files: tool({
            description:
                'Find files matching a glob pattern (e.g. "*.ts", "**/*.md"). Optional content substring filter.',
            inputSchema: z.object({
                root: z.string().describe('Directory to search, relative to root'),
                pattern: z.string().describe('Glob pattern using * and **'),
                content_contains: z.string().optional(),
            }),
            execute: async ({ root, pattern, content_contains }) =>
                executor.searchFiles(root, pattern, content_contains),
        }),

        grep_content: tool({
            description:
                'Search file or directory contents using a regex pattern. Returns matching lines with line numbers. Use this before modify_file to find exact locations.',
            inputSchema: z.object({
                path: z.string().describe('File or directory to search'),
                pattern: z.string().describe('Regex pattern to match'),
                case_sensitive: z.boolean().optional().default(false),
            }),
            execute: async ({ path: p, pattern, case_sensitive }) =>
                executor.grepContent(p, pattern, case_sensitive),
        }),

        analyze_codebase: tool({
            description:
                'Summarize structure: file counts, sizes, extensions. Read-only.',
            inputSchema: z.object({
                path: z.string().default('.'),
            }),
            execute: async ({ path: p }) => executor.analyzeCodeBase(p),
        }),

        list_skills: tool({
            description:
                'List absolute paths to SKILL.md files under configured skill directories.',
            inputSchema: z.object({}),
            execute: async () => executor.listSkills(),
        }),

        read_skill: tool({
            description:
                'Read a SKILL.md file by its absolute path (use list_skills first).',
            inputSchema: z.object({
                path: z.string(),
            }),
            execute: async ({ path: p }) => executor.readSkill(p),
        }),

        // ─── STAGED WRITES (need approval) ───────────────────────────

        create_file: tool({
            description:
                'Stage creation of a new file. Not written to disk until the user approves.',
            inputSchema: z.object({
                path: z.string(),
                content: z.string(),
            }),
            execute: async ({ path: p, content }) =>
                executor.createFile(p, content),
        }),

        modify_file: tool({
            description:
                'Stage a full replacement of an existing file. Pending approval.',
            inputSchema: z.object({
                path: z.string(),
                content: z.string().describe('Complete new file contents'),
            }),
            execute: async ({ path: p, content }) =>
                executor.modifyFile(p, content),
        }),

        delete_file: tool({
            description: 'Stage deletion of a file. Pending approval.',
            inputSchema: z.object({
                path: z.string(),
            }),
            execute: async ({ path: p }) => executor.deleteFile(p),
        }),

        create_folder: tool({
            description:
                'Stage creation of a directory. Uses mkdir -p on apply. Pending approval.',
            inputSchema: z.object({
                path: z.string().describe('Relative directory path'),
            }),
            execute: async ({ path: p }) => executor.createFolder(p),
        }),

        execute_shell: tool({
            description:
                'Queue a shell command to run after user approval. Use with care — dangerous.',
            inputSchema: z.object({
                command: z.string().describe('Shell command to queue'),
            }),
            execute: async ({ command }) => executor.queueShell(command),
        }),

        patch_file: tool({
            description:
                'Replace a specific block of text inside a file. Safer than modify_file for small changes. old_content must match exactly — use read_file or grep_content first to get the exact text.',
            inputSchema: z.object({
                path: z.string(),
                old_content: z.string().describe('Exact text to find — must match character for character'),
                new_content: z.string().describe('Text to replace it with'),
            }),
            execute: async ({ path: p, old_content, new_content }) =>
                executor.patchFile(p, old_content, new_content),
        }),


        // ─── AGENT MEMORY ─────────────────────────────────────────────

        write_note: tool({
            description:
                'Save a note to scratchpad memory for later steps. Good for tracking progress, open questions, or file paths discovered.',
            inputSchema: z.object({
                key: z.string().describe('Short label, e.g. "auth-files" or "todo"'),
                value: z.string().describe('Content to remember'),
            }),
            execute: async ({ key, value }) => {
                scratchpad.set(key, value);
                return `Saved note: "${key}"`;
            },
        }),

        read_note: tool({
            description: 'Read a previously saved scratchpad note by key.',
            inputSchema: z.object({
                key: z.string(),
            }),
            execute: async ({ key }) => {
                const val = scratchpad.get(key);
                return val ?? `No note found for key: "${key}"`;
            },
        }),
    };
}