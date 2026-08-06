/*
  Warnings:

  - A unique constraint covering the columns `[cnic]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cnic` to the `Parent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER');

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "cnic" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "guardianRelation" "GuardianRelation";

-- CreateIndex
CREATE UNIQUE INDEX "Parent_cnic_key" ON "Parent"("cnic");
