import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

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
      data: {
        ...dto,
        birthday: new Date(dto.birthday),
      },
    });
  }

  // Update teacher
  async update(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.teacher.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.birthday && {
          birthday: new Date(dto.birthday),
        }),
      },
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

    try {
      await this.prisma.teacher.delete({
        where: { id },
      });

      return {
        message: 'Teacher deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        'Cannot delete teacher because it is assigned to one or more classes.',
      );
    }
  }
}