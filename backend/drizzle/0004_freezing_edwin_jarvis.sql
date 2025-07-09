ALTER TABLE "draft_responses" DROP CONSTRAINT "draft_responses_parent_draft_id_draft_responses_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stack_auth_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stack_auth_id_unique" UNIQUE("stack_auth_id");