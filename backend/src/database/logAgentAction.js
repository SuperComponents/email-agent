"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAgentAction = logAgentAction;
const db_js_1 = require("./db.js");
const schema_js_1 = require("./schema.js");
async function logAgentAction({ threadId, action, emailId, draftResponseId, actorUserId, metadata, ipAddress }) {
    return await db_js_1.db.insert(schema_js_1.agent_actions).values({
        thread_id: threadId,
        action,
        email_id: emailId,
        draft_response_id: draftResponseId,
        actor_user_id: actorUserId,
        metadata,
        ip_address: ipAddress
    }).returning();
}
//# sourceMappingURL=logAgentAction.js.map