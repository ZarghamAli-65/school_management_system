import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    const { teacherIds, ...classData } = createClassDto;

    const classEntity = await this.prisma.class.create({
      data: classData,
    });

    if (teacherIds && teacherIds.length > 0) {
      await this.prisma.teacherClass.createMany({
        data: teacherIds.map((teacherId, index) => ({
          teacherId,
          classId: classEntity.id,
          isClassTeacher: index === 0,
        })),
        skipDuplicates: true,
      });
    }

    return this.findOne(classEntity.id);
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

  async update(
    id: number,
    updateClassDto: UpdateClassDto,
  ) {
    await this.findOne(id);

    const { teacherIds, ...classData } = updateClassDto;

    await this.prisma.class.update({
      where: { id },
      data: classData,
    });

    if (teacherIds !== undefined) {
      await this.prisma.teacherClass.deleteMany({
        where: {
          classId: id,
        },
      });

      if (teacherIds.length > 0) {
        await this.prisma.teacherClass.createMany({
          data: teacherIds.map((teacherId, index) => ({
            teacherId,
            classId: id,
            isClassTeacher: index === 0,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.teacherClass.deleteMany({
      where: {
        classId: id,
      },
    });

    return this.prisma.class.delete({
      where: { id },
    });
  }
}