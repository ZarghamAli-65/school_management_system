// src/class/class.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    const { studentIds, teacherIds, lessonIds, ...classData } = createClassDto;

    return this.prisma.class.create({
      data: {
        ...classData,
        // Direct relations (one-to-many)
        students: studentIds
          ? { connect: studentIds.map(id => ({ id })) }
          : undefined,
        lessons: lessonIds
          ? { connect: lessonIds.map(id => ({ id })) }
          : undefined,
        // Junction relation (many-to-many via TeacherClass)
        teachers: teacherIds
          ? {
              create: teacherIds.map(teacherId => ({
                teacher: { connect: { id: teacherId } },
              })),
            }
          : undefined,
      },
      include: {
        students: true,
        teachers: {
          include: { teacher: true },
        },
        lessons: true,
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
          include: { teacher: true },
        },
        lessons: true,
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
          include: { teacher: true },
        },
        lessons: true,
        exams: true,
        assignments: true,
        results: true,
        events: true,
        announcements: true,
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    const { studentIds, teacherIds, lessonIds, ...classData } = updateClassDto;

    // Check if the class exists
    await this.findOne(id);

    return this.prisma.class.update({
      where: { id },
      data: {
        ...classData,
        // Direct relations – replace the entire list
        students: studentIds
          ? { set: studentIds.map(id => ({ id })) }
          : undefined,
        lessons: lessonIds
          ? { set: lessonIds.map(id => ({ id })) }
          : undefined,
        // Junction relation – replace using the compound unique key
        teachers: teacherIds
          ? {
              set: teacherIds.map(teacherId => ({
                teacherId_classId: {
                  teacherId: teacherId,
                  classId: id,
                },
              })),
            }
          : undefined,
      },
      include: {
        students: true,
        teachers: {
          include: { teacher: true },
        },
        lessons: true,
        // Include other relations if needed
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