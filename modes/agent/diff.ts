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
}
