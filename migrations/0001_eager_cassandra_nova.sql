CREATE TABLE "number_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"uploaded_by" integer,
	"assigned_agent_id" integer,
	"file_name" text NOT NULL,
	"numbers_count" integer NOT NULL,
	"upload_date" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "number_uploads" ADD CONSTRAINT "number_uploads_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "number_uploads" ADD CONSTRAINT "number_uploads_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;