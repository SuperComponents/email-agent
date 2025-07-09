import { agentActionEnum } from './schema.js';
export interface LogAgentActionParams {
    threadId: number;
    action: typeof agentActionEnum.enumValues[number];
    emailId?: number;
    draftResponseId?: number;
    actorUserId?: number;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
}
export declare function logAgentAction({ threadId, action, emailId, draftResponseId, actorUserId, metadata, ipAddress }: LogAgentActionParams): Promise<{
    id: number;
    created_at: Date;
    thread_id: number;
    email_id: number | null;
    draft_response_id: number | null;
    actor_user_id: number | null;
    action: "email_read" | "email_forwarded" | "draft_created" | "draft_edited" | "draft_approved" | "draft_rejected" | "draft_sent" | "thread_assigned" | "thread_status_changed" | "thread_archived";
    metadata: unknown;
    ip_address: string | null;
}[]>;
//# sourceMappingURL=logAgentAction.d.ts.map