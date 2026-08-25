import { Module } from '@nestjs/common';

import { TeacherClassController } from './teacher-class.controller';
import { TeacherClassService } from './teacher-class.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TeacherClassController],
  providers: [TeacherClassService, PrismaService],
  exports: [TeacherClassService],
})
export class TeacherClassModule {}