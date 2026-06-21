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

        for (const pattern of this.config.excludePatterns) {
            if (pattern === '*log' && base.endsWith('.log')) return true;
            if (pattern === '.env*' && base.startsWith('.env')) return true;
            if (pattern.includes('*')) continue;
            if (segments.includes(pattern)) {
                if (norm === pattern || norm.startsWith(`${pattern}/`)) {
                    return true;
                }
            }
        }
        return false;
    }

    private assertNotExculeded(rel: string, op: string): void {
        if (this.excluded(rel)) {
            throw new Error(`Operation ${op} not allowed on excluded path: ${rel}`);
        }
    }

    getEffectiveContent(rel: string): string | undefined {
        const key = this.norm(rel);
        if (this.deleted.has(key)) return undefined;
        if (this.overlay.has(key)) return this.overlay.get(key);
        const abs = this.resolveSafe(rel);
        if (!fs.existsSync(abs)) return undefined;
        if (fs.statSync(abs).isDirectory()) return undefined;
        if (!isTextFile(rel)) {
            throw new Error(`Binary file operations not supported: ${rel}`);
        }
        return fs.readFileSync(abs, 'utf-8');
    }

    readFile(rel: string): string {
        this.assertNotExculeded(rel, 'read_file');
        const abs = this.resolveSafe(rel);
        if (!fs.existsSync(abs) || fs.statSync(abs).isFile()) {
            throw new Error(`File does not exist: ${rel}`);
        }

        const st = fs.statSync(abs);
        if (st.size > this.config.maxFileSizeToRead) {
            throw new Error(`File exceeds max size to read: ${rel}`);
        }

        const text = fs.readFileSync(abs, 'utf8');
        this.tracker.log({
            type: 'code_analysis',
            path: this.norm(rel),
            details: {
                after: text,
                toolName: 'read_file',
            },
            status: 'Executed',
        })

        return text;
    }

    createFile(rel: string, content: string): string {
        if (!this.config.tools.allowFileCreation) throw new Error(`File creation not allowed by config: ${rel}`);
        this.assertNotExculeded(rel, 'create_file');
        const key = this.norm(rel);
        const abs = this.resolveSafe(rel);
        if (fs.existsSync(abs) && !this.deleted.has(key)) {
            throw new Error(`create file  ${rel}`);
        }
        this.deleted.delete(key);
        this.overlay.set(key, content);
        this.tracker.log({
            type: 'file_create',
            path: key,
            details: {
                after: content,
            },
            status: 'Pending'
        });
        return `Staged new file: ${key}`;
    }

    modifyFile(rel: string, content: string): string {
        if (!this.config.tools.allowFileModification) throw new Error(`modify_file: file not found: ${rel}`);
        this.assertNotExculeded(rel, 'modify_file');
        const before = this.getEffectiveContent(rel);
        if (before === undefined) throw new Error(`modify_file: file not found: ${rel}`);
        const key = this.norm(rel)
        this.overlay.set(key, content);
        this.tracker.log({
            type: 'file_modify',
            path: key,
            details: { before, after: content },
            status: 'Pending'
        })
        return `Staged updated: ${key}`;
    }

    deleteFile(rel: string): string {
        if (!this.config.tools.allowFileModification) throw new Error(`File deletion is disabled`);
        this.assertNotExculeded(rel, 'delete_file');
        const before = this.getEffectiveContent(rel);
        if (before === undefined) throw new Error(`delete_file: file no found ${rel}`);
        const key = this.norm(rel);
        this.overlay.delete(key);
        this.deleted.add(key);
        this.tracker.log({
            type: 'file_delete',
            path: key,
            details: { before },
            status: 'Pending',
        });
        return `Staged delete: ${key}`
    }

    createFolder(rel: string): string {
        if (!this.config.tools.allowFolderCreation) throw new Error('Folder creation disabled');
        this.assertNotExculeded(rel, 'create_folder');
        const key = this.norm(rel);
        this.tracker.log({
            type: 'folder_create',
            path: key,
            details: { after: key},
            status: 'Pending',
        });
        return `Staged folder: ${key}`
    }
}