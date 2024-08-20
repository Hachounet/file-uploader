-- CreateTable
CREATE TABLE "SharedInstance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiracyDate" TIMESTAMP(3) NOT NULL,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "SharedInstance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SharedInstance" ADD CONSTRAINT "SharedInstance_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
