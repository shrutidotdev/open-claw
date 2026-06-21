export type ActionType =
    | "file_create"
    | "file_modify"
    | "folder_create"
    | "file_delete"
    | "file_create"
    | "code_analysis"
    | "tool_execute"
    | "shell_command";

export type ActionStatus = "Pending" | "Executed" | "Approved" | "Rejected";

export interface ActionLog {
    id: string;
    timestamp: Date;
    type: ActionType;
    path: string;
    details: {
        before?: string;
        after?: string;
        toolName?: string;
        toolResult?: string;
        error?: string;
        command?: string;
    };
    status: ActionStatus;
    userApproved?: boolean;
}

export interface AgentConfig {
    codebasePath: string;
    maxFileSizeToRead: number;
    excludePatterns: string[];
    tools: {
        allowShellExecution: boolean;
        allowFileModification: boolean;
        allowFileCreation: boolean;
        allowFolderCreation: boolean;
    }
}

export const defaultAgentConfig = (): AgentConfig => ({
    codebasePath: process.cwd(),
    maxFileSizeToRead: 1024 * 1024,
    excludePatterns: [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        '*.log',
        '.env*',
    ],
    tools: {
        allowShellExecution: true,
        allowFileModification: true,
        allowFileCreation: true,
        allowFolderCreation: true,
    },
});


export function isMutationType(type: ActionType): boolean {
    return (
        type === "file_create"
        || type === "file_modify"
        || type === "file_delete"
        || type === "tool_execute"
        || type === "shell_command"
        || type === "code_analysis"
    )
}
