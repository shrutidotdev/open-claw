export type ActionType = 
| "file_create"
| "file_modify"
| "file_delete"
| "file_create"
| "code_analysis"
| "tool_execute";

export type ActionStatus = "Pending" | "Executed" |"Approved" | "Rejected" ;

export interface ActionLog {
    id: string;
    timestamp: Date;
    type: ActionType;
}