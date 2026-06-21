import fs from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { spawnSync } from 'node:child_process';
import type { AgentConfig, ActionLog } from './types.ts';
import { ActionTracker } from './action-tracker.ts';

const TEXT_EXT = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
    '.json', '.md', '.mdx', '.css', '.html',
    '.yml', '.yaml', '.toml', '.txt',
]);

function isTextFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return TEXT_EXT.has(ext) || ext === '';
}

export class ToolExecutor {
    private overlay = new Map<string, string>();
    private deleted = new Set<string>();

    private readonly norm = (rel: string) =>
        path.posix.normalize(rel.split(path.sep).join('/')).replace(/^\.\//, '');

    constructor(private config: AgentConfig, private tracker: ActionTracker) { }

    private resolveSafe(rel: string): string {
        const abs = path.resolve(this.config.codebasePath, rel);
        const root = path.resolve(this.config.codebasePath);
        const relCheck = path.relative(root, abs);
        if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) {
            throw new Error(`Path escapes workspace: ${rel}`);
        }
        return abs;
    }

    private excluded(rel: string): boolean {
        const norm = this.norm(rel);
        const segments = norm.split('/');
        const base = segments[segments.length - 1] ?? ''; 
    }
}