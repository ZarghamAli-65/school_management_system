/*
  Warnings:

  - You are about to drop the column `date` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `end` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Result` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examDate` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passingMarks` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMarks` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `obtainedMarks` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_classId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_classId_fkey";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "date",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "classId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "end",
DROP COLUMN "start",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "roomNo" TEXT,
ADD COLUMN     "section" TEXT,
ALTER COLUMN "supervisor" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "venue" TEXT,
ALTER COLUMN "classId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "date",
ADD COLUMN     "examDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passingMarks" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "totalMarks" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "day" "Day" NOT NULL,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "date",
DROP COLUMN "score",
ADD COLUMN     "assignmentId" INTEGER,
ADD COLUMN     "examId" INTEGER,
ADD COLUMN     "obtainedMarks" INTEGER NOT NULL,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeacherClass" ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isClassTeacher" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TeacherSubject" ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
