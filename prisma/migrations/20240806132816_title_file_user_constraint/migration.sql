/*
  Warnings:

  - A unique constraint covering the columns `[title,ownerId]` on the table `Files` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Files_title_ownerId_key" ON "Files"("title", "ownerId");
