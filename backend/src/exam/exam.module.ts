// exam.module.ts
import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ExamService, PrismaService],
  controllers: [ExamController],
  exports: [ExamService],
})
export class ExamModule {}