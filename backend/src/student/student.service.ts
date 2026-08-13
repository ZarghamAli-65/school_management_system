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

    if (dto.classId) {
      const schoolClass = await this.prisma.class.findUnique({
        where: { id: dto.classId },
      });

      if (!schoolClass) {
        throw new BadRequestException('Selected class does not exist');
      }
    }

    return this.prisma.student.create({
      data: {
        studentId: dto.studentId,
        email: dto.email,
        username: dto.username,
        password: dto.password,

        firstName: dto.firstName,
        lastName: dto.lastName,
        fatherName: dto.fatherName,

        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth
          ? new Date(dto.dateOfBirth)
          : undefined,
        bloodType: dto.bloodType,
        placeOfBirth: dto.placeOfBirth,
        nationality: dto.nationality,
        religion: dto.religion,
        language: dto.language,

        street: dto.street,
        city: dto.city,
        province: dto.province,
        postalCode: dto.postalCode,
        country: dto.country,
        phone: dto.phone,
        photo: dto.photo,

        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactRelation: dto.emergencyContactRelation,

        guardianRelation: dto.guardianRelation,

        section: dto.section,
        rollNumber: dto.rollNumber,
        academicYear: dto.academicYear,

        enrollmentDate: dto.enrollmentDate
          ? new Date(dto.enrollmentDate)
          : undefined,
        admissionYear: dto.admissionYear,
        previousSchool: dto.previousSchool,
        status: dto.status,

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

    if (dto.classId) {
      const schoolClass = await this.prisma.class.findUnique({
        where: { id: dto.classId },
      });

      if (!schoolClass) {
        throw new BadRequestException('Selected class does not exist');
      }
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        studentId: dto.studentId,
        email: dto.email,
        username: dto.username,
        password: dto.password,

        firstName: dto.firstName,
        lastName: dto.lastName,
        fatherName: dto.fatherName,

        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth
          ? new Date(dto.dateOfBirth)
          : undefined,
        bloodType: dto.bloodType,
        placeOfBirth: dto.placeOfBirth,
        nationality: dto.nationality,
        religion: dto.religion,
        language: dto.language,

        street: dto.street,
        city: dto.city,
        province: dto.province,
        postalCode: dto.postalCode,
        country: dto.country,
        phone: dto.phone,
        photo: dto.photo,

        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactRelation: dto.emergencyContactRelation,

        guardianRelation: dto.guardianRelation,

        section: dto.section,
        rollNumber: dto.rollNumber,
        academicYear: dto.academicYear,

        enrollmentDate: dto.enrollmentDate
          ? new Date(dto.enrollmentDate)
          : undefined,
        admissionYear: dto.admissionYear,
        previousSchool: dto.previousSchool,
        status: dto.status,

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