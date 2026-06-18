-- Seed reference rows required by Files.statusId foreign key.
INSERT INTO "Status" ("id", "name")
VALUES
  (0, 'PENDING'),
  (1, 'EXTRACTING'),
  (2, 'EXTRACTED'),
  (3, 'ERROR')
ON CONFLICT ("id") DO UPDATE
SET "name" = EXCLUDED."name";
