import { tool } from 'ai';
import { z } from 'zod';
import type { ToolExecutor } from './tool-executor.ts';

export function createAgentTools(executor: ToolExecutor){
    return {
        // Read Only 
        read_file: tool({
            description: 'Read a text file from the workspace. Use a path relative to the project root.',,
            inputSchema: z.object({
                path: z.string().describe('Relative file path.')
            }),
            execute: async({ path : p }) => executor.readFile(p)
        })
    }
}