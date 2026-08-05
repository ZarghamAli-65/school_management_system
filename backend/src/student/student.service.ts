import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  // Get all
  async findAll() {
    return this.prisma.student.findMany({
      include: {
        parent: true,
        class: true,
      },
    });
  }

  // Get one
  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        parent: true,
        class: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  // Create
  async create(dto: CreateStudentDto) {
    if (dto.parentId) {
      const parent = await this.prisma.parent.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new BadRequestException('Selected parent does not exist');
      }
    }

    return this.prisma.student.create({
      data: {
        studentId: dto.studentId,
        username: dto.username,
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        address: dto.address,
        bloodType: dto.bloodType,
        gender: dto.gender,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        photo: dto.photo,
        grade: dto.grade,
        guardianRelation: dto.guardianRelation,

        ...(dto.classId && {
          class: {
            connect: {
              id: dto.classId,
            },
          },
        }),

        ...(dto.parentId && {
          parent: {
            connect: {
              id: dto.parentId,
            },
          },
        }),
      },
    });
  }

  // Update
  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.parent.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new BadRequestException('Selected parent does not exist');
      }
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        studentId: dto.studentId,
        username: dto.username,
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        address: dto.address,
        bloodType: dto.bloodType,
        gender: dto.gender,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        photo: dto.photo,
        grade: dto.grade,
        guardianRelation: dto.guardianRelation,

        ...(dto.classId && {
          class: {
            connect: {
              id: dto.classId,
            },
          },
        }),

        ...(dto.parentId && {
          parent: {
            connect: {
              id: dto.parentId,
            },
          },
        }),
      },
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
}
