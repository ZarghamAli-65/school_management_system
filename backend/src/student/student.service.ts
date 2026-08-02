import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  // Get all
  async findAll() {
    return this.prisma.student.findMany();
  }

  // Get one
  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  // Create
  async create(dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: dto,
    });
  }

  // Delete
  async remove(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.student.delete({
      where: { id },
    });

    return {
      message: 'Student deleted successfully',
    };
  }


  async update(id: number, updateStudentDto: UpdateStudentDto) {
    // 1. Check if student exists
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // 2. Update the record (Prisma will only update provided fields)
    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }
}