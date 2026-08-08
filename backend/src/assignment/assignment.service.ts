// assignment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssignmentDto: CreateAssignmentDto) {
    const { dueDate, ...rest } = createAssignmentDto;
    return this.prisma.assignment.create({
      data: {
        ...rest,
        dueDate: new Date(dueDate),
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });
  }

  async findAll() {
    return this.prisma.assignment.findMany({
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        teacher: true,
        results: true, // optionally include results
      },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  async update(id: number, updateAssignmentDto: UpdateAssignmentDto) {
    // Check existence
    await this.findOne(id);

    const { dueDate, ...rest } = updateAssignmentDto;
    const data: any = { ...rest };
    if (dueDate) {
      data.dueDate = new Date(dueDate);
    }

    return this.prisma.assignment.update({
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
    return this.prisma.assignment.delete({
      where: { id },
    });
  }
}