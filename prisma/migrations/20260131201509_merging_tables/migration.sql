/*
  Warnings:

  - Added the required column `userId` to the `TrustedContancts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrustedContancts" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TrustedContancts" ADD CONSTRAINT "TrustedContancts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
