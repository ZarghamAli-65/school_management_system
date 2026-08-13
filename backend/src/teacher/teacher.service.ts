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

  async findAll() {
  return this.prisma.teacher.findMany({
    include: {
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
    try {
      return await this.prisma.teacher.create({
        data: {
          teacherId: dto.teacherId,
          employeeId: dto.employeeId,
          email: dto.email,
          username: dto.username,
          password: dto.password,
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
    } catch (error) {
      throw new BadRequestException(
        'Cannot create teacher. Please check the teacher details.',
      );
    }
  }

  async update(id: number, dto: UpdateTeacherDto) {
    await this.findOne(id);

    try {
      return await this.prisma.teacher.update({
        where: { id },
        data: {
          teacherId: dto.teacherId,
          employeeId: dto.employeeId,
          email: dto.email,
          username: dto.username,
          password: dto.password,
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
    } catch (error) {
      throw new BadRequestException(
        'Cannot update teacher. Please check the teacher details.',
      );
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.teacher.delete({
        where: { id },
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