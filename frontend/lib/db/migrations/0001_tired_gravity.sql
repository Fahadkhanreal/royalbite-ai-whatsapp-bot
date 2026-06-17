CREATE TABLE "processed_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" varchar(500) NOT NULL,
	"phone_number" varchar(50),
	"message_preview" text,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "processed_webhooks_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE INDEX "idx_processed_webhooks_message_id" ON "processed_webhooks" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_processed_webhooks_processed_at" ON "processed_webhooks" USING btree ("processed_at");