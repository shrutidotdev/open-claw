import{ isMutationType, type ActionLog, type ActionStatus} from './types';

export class ActionTracker {
    // this is internal array to store all actions taken by the agent, including their status and details
    private actions: ActionLog[] = [];

    log(
        entry: Omit<ActionLog, 'id' | 'timestamp'> & {
            id?: string;
            timestamp?: Date; 
        },
        // with id and timestamps It pushes this formatted object into the tracking array and returns it so the orchestrator knows the log was successfully recorded.
    ): ActionLog{
        const action: ActionLog = {
            id: entry.id ?? `action_${this.actions.length}`,
            timestamp: entry.timestamp ?? new Date(),
            type: entry.type,
            path: entry.path,
            details: {...entry.details},
            status: entry.status,
            userApproved: entry.userApproved,
        } 
        this.actions.push(action);
        return action;
    }

    getActions(): readonly ActionLog[] {
        return this.actions;
    }

    getPendingMutations(): ActionLog[] {
        return this.actions.filter((a) => isMutationType(a.type) && a.status === "Pending");
    }

    updateStatus(id: string, status: ActionStatus, userApproved?: boolean): void {
        const action = this.actions.find((a) => a.id === id);
        if(!action) return;
        if (action) {
            action.status = status;
            action.userApproved = userApproved;
        }
    }
}