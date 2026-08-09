// result.module.ts
import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ResultService, PrismaService],
  controllers: [ResultController],
  exports: [ResultService],
})
export class ResultModule {}