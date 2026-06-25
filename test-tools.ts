// test-tools.ts
import { ToolExecutor } from './modes/agent/tool-executor.ts';
import { ActionTracker } from './modes/agent/action-tracker.ts';
import { defaultAgentConfig } from './modes/agent/types.ts';
import { createAgentTools } from './modes/agent/agent-tools.ts';

const executor = new ToolExecutor(defaultAgentConfig(), new ActionTracker());
const tools = createAgentTools(executor);

const expected = [
    'read_file', 'list_files', 'search_files', 'grep_content',
    'analyze_codebase', 'list_skills', 'read_skill',
    'create_file', 'modify_file', 'patch_file',
    'delete_file', 'create_folder', 'execute_shell',
    'write_note', 'read_note',
];

console.log('\n🔧 Checking tool registry\n');
let failed = 0;
for (const name of expected) {
    if (tools[name as keyof typeof tools]) {
        console.log(`  ✅ ${name}`);
    } else {
        console.log(`  ❌ ${name} — MISSING`);
        failed++;
    }
}

// Check each tool has required fields
console.log('\n🔍 Checking tool structure\n');
for (const [name, t] of Object.entries(tools)) {
    const tool = t as any;
    const hasDesc = typeof tool.description === 'string' && tool.description.length > 0;
    const hasSchema = !!tool.inputSchema;
    const hasExecute = typeof tool.execute === 'function';
    if (hasDesc && hasSchema && hasExecute) {
        console.log(`  ✅ ${name}`);
    } else {
        console.log(`  ❌ ${name} missing: ${[
            !hasDesc && 'description',
            !hasSchema && 'inputSchema',
            !hasExecute && 'execute',
        ].filter(Boolean).join(', ')}`);
        failed++;
    }
}

console.log(`\n${failed === 0 ? '✅ All tools valid' : `❌ ${failed} issues found`}\n`);
if (failed > 0) process.exit(1);