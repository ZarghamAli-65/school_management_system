import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        classes: {
          include: {
            class: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        classes: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async create(dto: CreateTeacherDto) {
    if (!dto.password) {
      throw new BadRequestException('Password is required for teacher account');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: `${dto.firstName ?? ''} ${dto.lastName ?? ''}`.trim(),
            email: dto.email,
            password: hashedPassword,
            role: 'TEACHER',
          },
        });

        return await tx.teacher.create({
          data: {
            teacherId: dto.teacherId,
            employeeId: dto.employeeId,
            email: dto.email,
            username: dto.username,
            password: hashedPassword,

            userId: user.id,

            firstName: dto.firstName,
            lastName: dto.lastName,
            fatherHusbandName: dto.fatherHusbandName,
            photo: dto.photo,
            phone: dto.phone,
            alternatePhone: dto.alternatePhone,
            address: dto.address,
            city: dto.city,
            state: dto.state,
            country: dto.country,
            postalCode: dto.postalCode,

            dateOfBirth: dto.dateOfBirth
              ? new Date(dto.dateOfBirth)
              : undefined,

            gender: dto.gender,
            maritalStatus: dto.maritalStatus,
            bloodType: dto.bloodType,
            nationality: dto.nationality,

            nationalId: dto.nationalId,
            passportNo: dto.passportNo,

            joiningDate: dto.joiningDate
              ? new Date(dto.joiningDate)
              : undefined,

            employmentType: dto.employmentType,
            employmentStatus: dto.employmentStatus,
            designation: dto.designation,

            latestQualification: dto.latestQualification,
            specialization: dto.specialization,
            experienceYears: dto.experienceYears,
            experienceField: dto.experienceField,
            bio: dto.bio,

            emergencyContactName: dto.emergencyContactName,
            emergencyContactPhone: dto.emergencyContactPhone,
            emergencyContactRelation: dto.emergencyContactRelation,

            isActive: dto.isActive,
          },
        });
      });
    } catch (error) {
      console.error('🔥 TEACHER CREATE ERROR:', error);

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Cannot create teacher',
      );
    }
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const existingTeacher = await this.findOne(id);

    try {
      let hashedPassword: string | undefined;

      if (dto.password) {
        hashedPassword = await bcrypt.hash(dto.password, 10);
      }

      return await this.prisma.$transaction(async (tx) => {
        const teacher = await tx.teacher.update({
          where: { id },
          data: {
            teacherId: dto.teacherId,
            employeeId: dto.employeeId,
            email: dto.email,
            username: dto.username,

            ...(hashedPassword ? { password: hashedPassword } : {}),

            firstName: dto.firstName,
            lastName: dto.lastName,
            fatherHusbandName: dto.fatherHusbandName,
            photo: dto.photo,
            phone: dto.phone,
            alternatePhone: dto.alternatePhone,
            address: dto.address,
            city: dto.city,
            state: dto.state,
            country: dto.country,
            postalCode: dto.postalCode,

            dateOfBirth: dto.dateOfBirth
              ? new Date(dto.dateOfBirth)
              : undefined,

            gender: dto.gender,
            maritalStatus: dto.maritalStatus,
            bloodType: dto.bloodType,
            nationality: dto.nationality,

            nationalId: dto.nationalId,
            passportNo: dto.passportNo,

            joiningDate: dto.joiningDate
              ? new Date(dto.joiningDate)
              : undefined,

            employmentType: dto.employmentType,
            employmentStatus: dto.employmentStatus,
            designation: dto.designation,

            latestQualification: dto.latestQualification,
            specialization: dto.specialization,
            experienceYears: dto.experienceYears,
            experienceField: dto.experienceField,
            bio: dto.bio,

            emergencyContactName: dto.emergencyContactName,
            emergencyContactPhone: dto.emergencyContactPhone,
            emergencyContactRelation: dto.emergencyContactRelation,

            isActive: dto.isActive,
          },
        });

        if (existingTeacher.user) {
          await tx.user.update({
            where: { id: existingTeacher.user.id },
            data: {
              name: `${dto.firstName ?? ''} ${dto.lastName ?? ''}`.trim(),
              email: dto.email,

              ...(hashedPassword ? { password: hashedPassword } : {}),
            },
          });
        }

        return teacher;
      });
    } catch (error) {
      throw new BadRequestException(
        'Cannot update teacher. Please check the teacher details.',
      );
    }
  }

  async remove(id: number) {
    const teacher = await this.findOne(id);

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.teacher.delete({
          where: { id },
        });

        if (teacher.user) {
          await tx.user.delete({
            where: { id: teacher.user.id },
          });
        }
      });

      return {
        message: 'Teacher deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        'Cannot delete teacher because it is assigned to one or more records.',
      );
    }
  }
}
