-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "description" TEXT,
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT';
