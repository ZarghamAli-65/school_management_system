import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  // Get all teachers
  async findAll() {
    return this.prisma.teacher.findMany();
  }

  // Get one teacher
  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  // Create teacher
  async create(dto: CreateTeacherDto) {
    return this.prisma.teacher.create({
      data: dto,
    });
  }

  // Update teacher
  async update(id: number, dto: CreateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.teacher.update({
      where: { id },
      data: dto,
    });
  }

  // Delete teacher
  async remove(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    await this.prisma.teacher.delete({
      where: { id },
    });

    return {
      message: 'Teacher deleted successfully',
    };
  }
}