// modes/agent/types.ts

/**
 * Supported operational modes for the AI Agent system
 */
export type AgentMode = 'agent' | 'plan' | 'ask';

/**
 * Status states for specific actions executed by the agent
 */
export type ActionStatus = 'pending' | 'running' | 'success' | 'failed' | 'rejected';

/**
 * Categories of foundational actions the agent can perform
 */
export type ActionType = 'tool_call' | 'file_operation' | 'shell_execution' | 'web_search';

/**
 * Represents the detailed structural footprint of any tool or system action taken
 */
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

/**
 * Constraints and safety boundaries protecting the runtime environment
 */
export interface AgentConfig {
  codebasePath: string;
  maxFileSizeToRead: number; // Prevent token blowouts on massive files
  excludePatterns: string[]; // e.g., ['node_modules', '.git', 'dist']
  tools: {
    allowShellExecution: boolean; // Flag to gate terminal access via approval systems
    allowFileModification: boolean; // Flag to gate file system changes via approval systems
    allowFileCreation: boolean; // Flag to gate new file creation via approval systems
    allowFolderCreation: boolean; // Flag to gate new folder creation via approval systems
  };
}

export const defaultAgentCongif: () => AgentConfig = () => ({
    codebasePath: process.cwd(),
    maxFileSizeToRead: 100 * 1024, // 100 KB
    excludePatterns: ['node_modules', '.git', 'dist', 'build', ".next", "*.log", ".env*"],
    tools: {
      allowShellExecution: false,
      allowFileModification: false,
      allowFileCreation: false,
      allowFolderCreation: false,
    },
});

/**
 * The standard structural response contract returned by the LLM core
 */
export interface AgentResponse {
  thought: string;
  toolCall?: {
    name: string;
    arguments: Record<string, any>;
  };
  finalAnswer?: string;
}

/**
 * Internal system representation of files parsed into vector chunks or context references
 */
export interface FileContext {
  filename: string;
  relativePath: string;
  content: string;
  extension: string;
  size: number;
}