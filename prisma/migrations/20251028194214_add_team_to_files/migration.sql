-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "teamId" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "files_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_files" ("createdAt", "extension", "folderId", "hash", "id", "metadata", "mimeType", "name", "originalName", "size", "status", "tags", "thumbnailUrl", "updatedAt", "url", "userId") SELECT "createdAt", "extension", "folderId", "hash", "id", "metadata", "mimeType", "name", "originalName", "size", "status", "tags", "thumbnailUrl", "updatedAt", "url", "userId" FROM "files";
DROP TABLE "files";
ALTER TABLE "new_files" RENAME TO "files";
CREATE UNIQUE INDEX "files_hash_teamId_key" ON "files"("hash", "teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
