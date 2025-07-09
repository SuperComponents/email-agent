"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentActionsRelations = exports.draftResponsesRelations = exports.emailsRelations = exports.threadsRelations = exports.usersRelations = exports.agent_actions = exports.draft_responses = exports.emails = exports.threads = exports.users = exports.agentActionEnum = exports.roleEnum = exports.draftStatusEnum = exports.directionEnum = exports.statusEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Define enums first
exports.statusEnum = (0, pg_core_1.pgEnum)('status', ['active', 'closed', 'needs_attention']);
exports.directionEnum = (0, pg_core_1.pgEnum)('direction', ['inbound', 'outbound']);
exports.draftStatusEnum = (0, pg_core_1.pgEnum)('draft_status', ['pending', 'approved', 'rejected', 'sent']);
exports.roleEnum = (0, pg_core_1.pgEnum)('role', ['agent', 'manager', 'admin']);
exports.agentActionEnum = (0, pg_core_1.pgEnum)('agent_action', [
    'email_read',
    'email_forwarded',
    'draft_created',
    'draft_edited',
    'draft_approved',
    'draft_rejected',
    'draft_sent',
    'thread_assigned',
    'thread_status_changed',
    'thread_archived'
]);
// User Table
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).unique().notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    role: (0, exports.roleEnum)('role').notNull().default('agent'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Thread Table
exports.threads = (0, pg_core_1.pgTable)('threads', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    subject: (0, pg_core_1.varchar)('subject', { length: 500 }).notNull(),
    participant_emails: (0, pg_core_1.jsonb)('participant_emails').notNull(),
    status: (0, exports.statusEnum)('status').notNull().default('active'),
    last_activity_at: (0, pg_core_1.timestamp)('last_activity_at').notNull().defaultNow(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Email Table
exports.emails = (0, pg_core_1.pgTable)('emails', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    thread_id: (0, pg_core_1.integer)('thread_id').references(() => exports.threads.id).notNull(),
    from_email: (0, pg_core_1.varchar)('from_email', { length: 255 }).notNull(),
    to_emails: (0, pg_core_1.jsonb)('to_emails').notNull(),
    cc_emails: (0, pg_core_1.jsonb)('cc_emails'),
    bcc_emails: (0, pg_core_1.jsonb)('bcc_emails'),
    subject: (0, pg_core_1.varchar)('subject', { length: 500 }).notNull(),
    body_text: (0, pg_core_1.text)('body_text'),
    body_html: (0, pg_core_1.text)('body_html'),
    direction: (0, exports.directionEnum)('direction').notNull(),
    is_draft: (0, pg_core_1.boolean)('is_draft').notNull().default(false),
    sent_at: (0, pg_core_1.timestamp)('sent_at'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Draft Response Table
exports.draft_responses = (0, pg_core_1.pgTable)('draft_responses', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    email_id: (0, pg_core_1.integer)('email_id').references(() => exports.emails.id).notNull(),
    thread_id: (0, pg_core_1.integer)('thread_id').references(() => exports.threads.id).notNull(),
    generated_content: (0, pg_core_1.text)('generated_content').notNull(),
    status: (0, exports.draftStatusEnum)('status').notNull().default('pending'),
    created_by_user_id: (0, pg_core_1.integer)('created_by_user_id').references(() => exports.users.id),
    version: (0, pg_core_1.integer)('version').notNull().default(1),
    parent_draft_id: (0, pg_core_1.integer)('parent_draft_id'),
    confidence_score: (0, pg_core_1.decimal)('confidence_score', { precision: 4, scale: 3 }),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
// Agent Actions Table
exports.agent_actions = (0, pg_core_1.pgTable)('agent_actions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    thread_id: (0, pg_core_1.integer)('thread_id')
        .references(() => exports.threads.id, { onDelete: 'restrict' })
        .notNull(),
    email_id: (0, pg_core_1.integer)('email_id')
        .references(() => exports.emails.id, { onDelete: 'set null' }),
    draft_response_id: (0, pg_core_1.integer)('draft_response_id')
        .references(() => exports.draft_responses.id, { onDelete: 'set null' }),
    actor_user_id: (0, pg_core_1.integer)('actor_user_id')
        .references(() => exports.users.id, { onDelete: 'set null' }),
    action: (0, exports.agentActionEnum)('action').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    ip_address: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
}, (table) => ({
    threadTimelineIdx: (0, pg_core_1.index)('thread_timeline_idx').on(table.thread_id, table.created_at.desc()),
    actorIdx: (0, pg_core_1.index)('actor_idx').on(table.actor_user_id)
}));
// Define relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    draft_responses: many(exports.draft_responses),
    agent_actions: many(exports.agent_actions)
}));
exports.threadsRelations = (0, drizzle_orm_1.relations)(exports.threads, ({ many }) => ({
    emails: many(exports.emails),
    draft_responses: many(exports.draft_responses),
    agent_actions: many(exports.agent_actions)
}));
exports.emailsRelations = (0, drizzle_orm_1.relations)(exports.emails, ({ one, many }) => ({
    thread: one(exports.threads, {
        fields: [exports.emails.thread_id],
        references: [exports.threads.id]
    }),
    draft_responses: many(exports.draft_responses),
    agent_actions: many(exports.agent_actions)
}));
exports.draftResponsesRelations = (0, drizzle_orm_1.relations)(exports.draft_responses, ({ one, many }) => ({
    email: one(exports.emails, {
        fields: [exports.draft_responses.email_id],
        references: [exports.emails.id]
    }),
    thread: one(exports.threads, {
        fields: [exports.draft_responses.thread_id],
        references: [exports.threads.id]
    }),
    created_by_user: one(exports.users, {
        fields: [exports.draft_responses.created_by_user_id],
        references: [exports.users.id]
    }),
    parent_draft: one(exports.draft_responses, {
        fields: [exports.draft_responses.parent_draft_id],
        references: [exports.draft_responses.id]
    }),
    agent_actions: many(exports.agent_actions)
}));
exports.agentActionsRelations = (0, drizzle_orm_1.relations)(exports.agent_actions, ({ one }) => ({
    thread: one(exports.threads, {
        fields: [exports.agent_actions.thread_id],
        references: [exports.threads.id]
    }),
    email: one(exports.emails, {
        fields: [exports.agent_actions.email_id],
        references: [exports.emails.id]
    }),
    draft_response: one(exports.draft_responses, {
        fields: [exports.agent_actions.draft_response_id],
        references: [exports.draft_responses.id]
    }),
    actor_user: one(exports.users, {
        fields: [exports.agent_actions.actor_user_id],
        references: [exports.users.id]
    })
}));
//# sourceMappingURL=schema.js.map