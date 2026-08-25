import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherClassDto } from './dto/create-teacher-class.dto';

@Injectable()
export class TeacherClassService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE / ASSIGN
  // =========================

  async create(dto: CreateTeacherClassDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id: dto.teacherId,
      },
    });

    if (!teacher) {
      throw new NotFoundException(
        `Teacher with ID ${dto.teacherId} not found.`,
      );
    }

    const classRecord = await this.prisma.class.findUnique({
      where: {
        id: dto.classId,
      },
    });

    if (!classRecord) {
      throw new NotFoundException(
        `Class with ID ${dto.classId} not found.`,
      );
    }

    const existingAssignment =
      await this.prisma.teacherClass.findUnique({
        where: {
          teacherId_classId: {
            teacherId: dto.teacherId,
            classId: dto.classId,
          },
        },
      });

    if (existingAssignment) {
      throw new BadRequestException(
        'This teacher is already assigned to this class.',
      );
    }

    try {
      return await this.prisma.teacherClass.create({
        data: {
          teacherId: dto.teacherId,
          classId: dto.classId,
          isClassTeacher: dto.isClassTeacher ?? false,
        },
        include: {
          teacher: true,
          class: true,
        },
      });
    } catch (error) {
      console.error('Create teacher-class error:', error);

      throw new BadRequestException(
        'Cannot assign teacher to class.',
      );
    }
  }

  // =========================
  // FIND ALL
  // =========================

  async findAll() {
    return this.prisma.teacherClass.findMany({
      orderBy: {
        assignedAt: 'desc',
      },
      include: {
        teacher: true,
        class: true,
      },
    });
  }

  // =========================
  // FIND TEACHER CLASSES
  // =========================

  async findByTeacher(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!teacher) {
      throw new NotFoundException(
        `Teacher with ID ${teacherId} not found.`,
      );
    }

    return this.prisma.teacherClass.findMany({
      where: {
        teacherId,
      },
      orderBy: {
        assignedAt: 'desc',
      },
      include: {
        class: true,
      },
    });
  }

  // =========================
  // FIND CLASS TEACHERS
  // =========================

  async findByClass(classId: number) {
    const classRecord = await this.prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!classRecord) {
      throw new NotFoundException(
        `Class with ID ${classId} not found.`,
      );
    }

    return this.prisma.teacherClass.findMany({
      where: {
        classId,
      },
      orderBy: {
        assignedAt: 'desc',
      },
      include: {
        teacher: true,
      },
    });
  }

  // =========================
  // REMOVE ASSIGNMENT
  // =========================

  async remove(teacherId: number, classId: number) {
    const assignment =
      await this.prisma.teacherClass.findUnique({
        where: {
          teacherId_classId: {
            teacherId,
            classId,
          },
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teacher is not assigned to this class.',
      );
    }

    await this.prisma.teacherClass.delete({
      where: {
        teacherId_classId: {
          teacherId,
          classId,
        },
      },
    });

    return {
      message: 'Teacher removed from class successfully.',
    };
  }
}