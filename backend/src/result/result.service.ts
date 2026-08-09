// result.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Injectable()
export class ResultService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResultDto: CreateResultDto) {
    return this.prisma.result.create({
      data: createResultDto,
      include: {
        student: true,
        subject: true,
        class: true,
        teacher: true,
        exam: true,
        assignment: true,
      },
    });
  }

  async findAll() {
    return this.prisma.result.findMany({
      include: {
        student: true,
        subject: true,
        class: true,
        teacher: true,
        exam: true,
        assignment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const result = await this.prisma.result.findUnique({
      where: { id },
      include: {
        student: true,
        subject: true,
        class: true,
        teacher: true,
        exam: true,
        assignment: true,
      },
    });
    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }
    return result;
  }

  async update(id: number, updateResultDto: UpdateResultDto) {
    await this.findOne(id);
    return this.prisma.result.update({
      where: { id },
      data: updateResultDto,
      include: {
        student: true,
        subject: true,
        class: true,
        teacher: true,
        exam: true,
        assignment: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.result.delete({
      where: { id },
    });
  }
}