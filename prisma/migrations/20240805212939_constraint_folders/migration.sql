/*
  Warnings:

  - A unique constraint covering the columns `[title,ownerId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folder_title_ownerId_key" ON "Folder"("title", "ownerId");
