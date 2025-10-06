-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_feedbacks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "project_id" TEXT NOT NULL,
    "author_id" TEXT,
    "author_email" TEXT,
    "author_name" TEXT,
    "coordinates" TEXT,
    "selector" TEXT,
    "attachments" TEXT,
    "ai_analysis" TEXT,
    "needs_ai_regeneration" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "feedbacks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feedbacks_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_feedbacks" ("attachments", "author_email", "author_id", "author_name", "category", "coordinates", "created_at", "description", "id", "project_id", "selector", "severity", "status", "title", "updated_at") SELECT "attachments", "author_email", "author_id", "author_name", "category", "coordinates", "created_at", "description", "id", "project_id", "selector", "severity", "status", "title", "updated_at" FROM "feedbacks";
DROP TABLE "feedbacks";
ALTER TABLE "new_feedbacks" RENAME TO "feedbacks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
