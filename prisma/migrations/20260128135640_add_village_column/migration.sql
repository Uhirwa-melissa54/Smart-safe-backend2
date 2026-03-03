/*
  Warnings:

  - Added the required column `cell` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sector` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `village` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "cell" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "sector" TEXT NOT NULL,
ADD COLUMN     "village" TEXT NOT NULL;
