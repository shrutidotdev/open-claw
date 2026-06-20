import { createTwoFilesPatch } from 'diff';
import type { ActionLog } from './types';

export function getBeforeAndAfter(action: ActionLog[]): { before: string, after: string } {
    if (action.length === 0) {
        return { before: '', after: '' };
    }

    const first = action[0];
    const last = action[action.length - 1];

    // if file was deleted afterwards = nothing
    if (last?.type === "file_delete") {
        return {
            before: last.details.before ?? '',
            after: ''
        }
    }

    // the file was created , before is nothing
    if(first?.type === "file_create"){
        return {
            before: '',
            after: last?.details.after ?? ''
        }
    }

    // whatever the first action left behind = initial state
    const before = first?.details.before ?? '';

    // whatever the last action left behind = final state 
    const after = last?.details.after ?? '';

    return { before , after};
}


export function buildDiff(before: string, after: string, filePath: string): string{
    if(before === after) return '(No changes detected)';

    return createTwoFilesPatch(
        filePath,
        filePath,
        before,
        after,
        '',
        '',
        { context: 3}
    )
}