/*
  Warnings:

  - You are about to drop the column `name` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nationalId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passportNo]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fatherName` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'CONTRACT', 'INTERN');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'GRADUATED', 'TRANSFERRED', 'WITHDRAWN', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('QUIZ', 'CLASS_TEST', 'MONTHLY', 'MIDTERM', 'FINAL', 'PRACTICAL', 'MOCK', 'ENTRY_TEST', 'OTHER');

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_classId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- DropIndex
DROP INDEX "Class_name_key";

-- DropIndex
DROP INDEX "Subject_name_key";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "name",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "enrolledCount" INTEGER,
ADD COLUMN     "isActive" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "code" TEXT,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "roomNo" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "type" "ExamType" NOT NULL DEFAULT 'FINAL';

-- AlterTable
ALTER TABLE "Parent" DROP COLUMN "image",
ADD COLUMN     "alternatePhone" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "employer" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus",
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "qualification" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "cnic" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "address",
DROP COLUMN "birthday",
DROP COLUMN "grade",
ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "admissionYear" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "enrollmentDate" TIMESTAMP(3),
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "previousSchool" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "rollNumber" INTEGER,
ADD COLUMN     "section" TEXT,
ADD COLUMN     "status" "StudentStatus" DEFAULT 'ACTIVE',
ADD COLUMN     "street" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "category" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "gradeLevel" TEXT,
ADD COLUMN     "shortName" TEXT;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "birthday",
ADD COLUMN     "alternatePhone" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "employmentType" "EmploymentType",
ADD COLUMN     "experienceField" TEXT,
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "fatherHusbandName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "latestQualification" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus",
ADD COLUMN     "nationalId" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "passportNo" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "state" TEXT;

-- DropTable
DROP TABLE "Lesson";

-- CreateTable
CREATE TABLE "ClassSchedule" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "day" "Day" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exam_code_key" ON "Exam"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_employeeId_key" ON "Teacher"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_nationalId_key" ON "Teacher"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_passportNo_key" ON "Teacher"("passportNo");

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
