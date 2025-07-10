CREATE TABLE "email_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_id" integer NOT NULL,
	"tag" varchar(50) NOT NULL,
	"confidence" numeric(4, 3),
	"created_by_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "thread_timeline_idx";--> statement-breakpoint
ALTER TABLE "agent_actions" ALTER COLUMN "action" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "agent_actions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "draft_responses" ADD COLUMN "citations" jsonb;--> statement-breakpoint
ALTER TABLE "email_tags" ADD CONSTRAINT "email_tags_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_tags" ADD CONSTRAINT "email_tags_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_tag_idx" ON "email_tags" USING btree ("email_id","tag");--> statement-breakpoint
CREATE INDEX "tag_idx" ON "email_tags" USING btree ("tag");--> statement-breakpoint
CREATE INDEX "thread_timeline_idx" ON "agent_actions" USING btree ("thread_id","created_at" desc);