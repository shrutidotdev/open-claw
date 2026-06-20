// To handle human in the loop interactive ui
import { select, isCancel} from "@clack/prompts";
import chalk from "chalk";
import { ActionTracker } from "./action-tracker";
import type { ActionLog } from './types.ts';

interface ReviewGroup {
    label: string;
    actionIds: string[];
    patch: string | null;
}

function groupPending(pending: ActionLog[]): ReviewGroup[] {
    const byPath = new Map<string, ActionLog[]>();
    const shells: ActionLog[] = [];

    for(const action of pending){
        if(action.type === "shell_command"){
            shells.push(action);
            continue;
        } else {
            const path = action.path || "unknown";
            if(!byPath.has(path)){
                byPath.set(path, []);
            }
            byPath.get(path)?.push(action);
        }
    }
    const groups: ReviewGroup[] = [];
    for(const [label, actions] of byPath){
        groups.push({ label, actionIds: actions.map(a => a.id), patch: null });
    }
    if(shells.length > 0){
        groups.push({ label: "Shell Commands", actionIds: shells.map(a => a.id), patch: null });
    }
    return groups;
}