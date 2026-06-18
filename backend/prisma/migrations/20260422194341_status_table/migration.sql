/*
  Warnings:

  - You are about to drop the column `status` on the `Files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Files" DROP COLUMN "status",
ADD COLUMN     "statusId" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Status" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_name_key" ON "Status"("name");

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
