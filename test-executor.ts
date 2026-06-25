import { ToolExecutor } from './modes/agent/tool-executor.ts';
import { ActionTracker } from './modes/agent/action-tracker.ts';
import { defaultAgentConfig } from './modes/agent/types.ts';

const config = defaultAgentConfig();
const tracker = new ActionTracker();
const executor = new ToolExecutor(config, tracker);

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (e: any) {
        console.log(`  ❌ ${name}`);
        console.log(`     ${e.message}`);
        failed++;
    }
}

// ─── READ ONLY ────────────────────────────────────────────
console.log('\n📖 Read-only tools\n');

test('list_files — root', () => {
    const out = executor.listFiles('.', false);
    if (!out.includes('package.json')) throw new Error(`Expected package.json, got: ${out}`);
});

test('list_files — recursive', () => {
    const out = executor.listFiles('.', true);
    if (out === '(empty)') throw new Error('Got empty result');
});

test('read_file — package.json', () => {
    const out = executor.readFile('package.json');
    if (!out.includes('"name"')) throw new Error('Invalid package.json content');
});

test('read_file — missing file throws', () => {
    try {
        executor.readFile('does-not-exist.ts');
        throw new Error('Should have thrown');
    } catch (e: any) {
        if (e.message === 'Should have thrown') throw e;
        // expected — pass
    }
});

test('search_files — find ts files', () => {
    const out = executor.searchFiles('.', '*.ts');
    if (out === '(no matches)') throw new Error('Should find .ts files');
});

test('analyze_codebase', () => {
    const out = executor.analyzeCodeBase('.');
    if (!out.includes('Files:')) throw new Error(`Unexpected output: ${out}`);
});

test('grep_content — find import', () => {
    const out = executor.grepContent('package.json', '"name"', false);
    if (out === '(no matches)') throw new Error('Should match "name" in package.json');
});

// ─── STAGED WRITES ────────────────────────────────────────
console.log('\n✏️  Staged write tools\n');

test('create_file — stages correctly', () => {
    const out = executor.createFile('test-staged.ts', 'export const x = 1;');
    if (!out.includes('Staged')) throw new Error(`Unexpected: ${out}`);
});

test('create_file — content in overlay', () => {
    const content = executor.getEffectiveContent('test-staged.ts');
    if (content !== 'export const x = 1;') throw new Error(`Wrong content: ${content}`);
});

test('modify_file — staged file', () => {
    const out = executor.modifyFile('test-staged.ts', 'export const x = 2;');
    if (!out.includes('Staged')) throw new Error(`Unexpected: ${out}`);
});

test('patch_file — exact match', () => {
    const out = executor.patchFile('test-staged.ts', 'const x = 2', 'const x = 99');
    if (!out.includes('Staged')) throw new Error(`Unexpected: ${out}`);
});

test('patch_file — bad match throws', () => {
    try {
        executor.patchFile('test-staged.ts', 'this text does not exist', 'new text');
        throw new Error('Should have thrown');
    } catch (e: any) {
        if (e.message === 'Should have thrown') throw e;
    }
});

test('delete_file — staged file', () => {
    const out = executor.deleteFile('test-staged.ts');
    if (!out.includes('Staged')) throw new Error(`Unexpected: ${out}`);
});

test('create_folder — stages correctly', () => {
    const out = executor.createFolder('test-new-folder');
    if (!out.includes('Staged')) throw new Error(`Unexpected: ${out}`);
});

test('queue_shell — stages command', () => {
    const out = executor.queueShell('echo hello');
    if (!out.includes('Shell Queued')) throw new Error(`Unexpected: ${out}`);
});

// ─── SCRATCHPAD ───────────────────────────────────────────
console.log('\n🧠 ActionTracker\n');

test('tracker has logged actions', () => {
    const actions = tracker.getActions();
    if (actions.length === 0) throw new Error('No actions logged');
    console.log(`     (${actions.length} actions logged)`);
});

// ─── SUMMARY ──────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`  ${passed} passed  |  ${failed} failed`);
console.log(`${'─'.repeat(40)}\n`);
if (failed > 0) process.exit(1);