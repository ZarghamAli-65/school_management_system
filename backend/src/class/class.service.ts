// src/class/class.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    return this.prisma.class.create({
      data: {
        ...createClassDto,
      },
      include: {
        students: true,
        teachers: {
          include: {
            teacher: true,
          },
        },
        classSchedules: true,
        exams: true,
        assignments: true,
        results: true,
        events: true,
        announcements: true,
      },
    });
  }

  async findAll() {
    return this.prisma.class.findMany({
      include: {
        students: true,
        teachers: {
          include: {
            teacher: true,
          },
        },
        classSchedules: true,
        exams: true,
        assignments: true,
        results: true,
        events: true,
        announcements: true,
      },
    });
  }

  async findOne(id: number) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        teachers: {
          include: {
            teacher: true,
          },
        },
        classSchedules: true,
        exams: true,
        assignments: true,
        results: true,
        events: true,
        announcements: true,
      },
    });

    if (!classEntity) {
      throw new NotFoundException(
        `Class with ID ${id} not found`,
      );
    }

    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    await this.findOne(id);

    return this.prisma.class.update({
      where: { id },
      data: {
        ...updateClassDto,
      },
      include: {
        students: true,
        teachers: {
          include: {
            teacher: true,
          },
        },
        classSchedules: true,
        exams: true,
        assignments: true,
        results: true,
        events: true,
        announcements: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.class.delete({
      where: { id },
    });
  }
}