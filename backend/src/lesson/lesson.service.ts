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

  // Get all lessons
  async findAll() {
    return this.prisma.lesson.findMany({
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });
  }

  // Get one lesson
  async findOne(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
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

  // Create lesson
  async create(dto: CreateLessonDto) {
    try {
      return await this.prisma.lesson.create({
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

  // Update lesson
  async update(id: number, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    try {
      return await this.prisma.lesson.update({
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

  // Delete lesson
  async remove(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    try {
      await this.prisma.lesson.delete({
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