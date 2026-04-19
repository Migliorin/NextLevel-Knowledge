ALTER TABLE "Files" ADD COLUMN "status" INTEGER NOT NULL DEFAULT 0;

UPDATE "Files"
SET "status" = CASE
    WHEN "extracted" = true THEN 2
    ELSE 0
END;

ALTER TABLE "Files" DROP COLUMN "extracted";
