ALTER TABLE "properties" ALTER COLUMN "area" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "area" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "year_built" SET DATA TYPE varchar(50);