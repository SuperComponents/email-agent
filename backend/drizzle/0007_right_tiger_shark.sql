ALTER TYPE "public"."agent_action" ADD VALUE 'internal_note_created';--> statement-breakpoint
ALTER TYPE "public"."agent_action" ADD VALUE 'internal_note_updated';--> statement-breakpoint
ALTER TYPE "public"."agent_action" ADD VALUE 'internal_note_deleted';--> statement-breakpoint
CREATE TABLE "internal_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"author_user_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_actions" ADD COLUMN "internal_note_id" integer;--> statement-breakpoint
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "internal_notes_thread_idx" ON "internal_notes" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "internal_notes_author_idx" ON "internal_notes" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "internal_notes_thread_pinned_idx" ON "internal_notes" USING btree ("thread_id","is_pinned");--> statement-breakpoint
ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_internal_note_id_internal_notes_id_fk" FOREIGN KEY ("internal_note_id") REFERENCES "public"."internal_notes"("id") ON DELETE set null ON UPDATE no action;