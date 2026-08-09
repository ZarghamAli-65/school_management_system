// exam.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, ExamStatus } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExamDto: CreateExamDto) {
    const { examDate, ...rest } = createExamDto;
    return this.prisma.exam.create({
      data: {
        ...rest,
        examDate: new Date(examDate),
        status: rest.status || ExamStatus.DRAFT, // fallback if not provided
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });
  }

  async findAll() {
    return this.prisma.exam.findMany({
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        teacher: true,
        results: true, // optionally include results
      },
    });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return exam;
  }

  async update(id: number, updateExamDto: UpdateExamDto) {
    // Check existence
    await this.findOne(id);

    const { examDate, ...rest } = updateExamDto;
    const data: any = { ...rest };
    if (examDate) {
      data.examDate = new Date(examDate);
    }

    return this.prisma.exam.update({
      where: { id },
      data,
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.exam.delete({
      where: { id },
    });
  }
}