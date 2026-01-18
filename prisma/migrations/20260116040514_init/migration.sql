-- CreateTable
CREATE TABLE "ProgressLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subject" TEXT NOT NULL,
    "topic" TEXT,
    "score" TEXT,
    "mistakes" TEXT,
    "fixStrategy" TEXT,
    "nextDrill" TEXT
);
