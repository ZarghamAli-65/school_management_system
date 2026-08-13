import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.classSchedule.findMany({
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });
  }

  async findOne(id: number) {
    const lesson = await this.prisma.classSchedule.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async create(dto: CreateLessonDto) {
    try {
      return await this.prisma.classSchedule.create({
        data: {
          ...dto,
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
        },
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Cannot create lesson. Please check subject, class, teacher, and lesson details.',
      );
    }
  }

  async update(id: number, dto: UpdateLessonDto) {
    const lesson = await this.prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    try {
      return await this.prisma.classSchedule.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.startTime && {
            startTime: new Date(dto.startTime),
          }),
          ...(dto.endTime && {
            endTime: new Date(dto.endTime),
          }),
        },
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Cannot update lesson. Please check subject, class, teacher, and lesson details.',
      );
    }
  }

  async remove(id: number) {
    const lesson = await this.prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    try {
      await this.prisma.classSchedule.delete({
        where: { id },
      });

      return {
        message: 'Lesson deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Cannot delete lesson.');
    }
  }
}