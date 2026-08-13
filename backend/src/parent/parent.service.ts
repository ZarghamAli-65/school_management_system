import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}

  async create(createParentDto: CreateParentDto) {
    let hashedPassword: string | undefined;

    if (createParentDto.password) {
      hashedPassword = await bcrypt.hash(
        createParentDto.password,
        10,
      );
    }

    return this.prisma.parent.create({
      data: {
        username: createParentDto.username,
        email: createParentDto.email,
        password: hashedPassword,

        firstName: createParentDto.firstName,
        lastName: createParentDto.lastName,
        photo: createParentDto.photo,

        gender: createParentDto.gender,

        dateOfBirth: createParentDto.dateOfBirth
          ? new Date(createParentDto.dateOfBirth)
          : undefined,

        bloodType: createParentDto.bloodType,
        nationality: createParentDto.nationality,
        maritalStatus: createParentDto.maritalStatus,

        phone: createParentDto.phone,
        alternatePhone: createParentDto.alternatePhone,
        address: createParentDto.address,
        city: createParentDto.city,
        province: createParentDto.province,
        country: createParentDto.country,
        postalCode: createParentDto.postalCode,

        cnic: createParentDto.cnic,

        qualification: createParentDto.qualification,

        occupation: createParentDto.occupation,
        employer: createParentDto.employer,
        jobTitle: createParentDto.jobTitle,
      },
    });
  }

  async findAll() {
    return this.prisma.parent.findMany({
      include: {
        students: true,
      },
    });
  }

  async findOne(id: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        students: true,
      },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent with ID ${id} not found`,
      );
    }

    return parent;
  }

  async update(
    id: number,
    updateParentDto: UpdateParentDto,
  ) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent with ID ${id} not found`,
      );
    }

    const data: any = {
      username: updateParentDto.username,
      email: updateParentDto.email,

      firstName: updateParentDto.firstName,
      lastName: updateParentDto.lastName,
      photo: updateParentDto.photo,

      gender: updateParentDto.gender,

      dateOfBirth: updateParentDto.dateOfBirth
        ? new Date(updateParentDto.dateOfBirth)
        : undefined,

      bloodType: updateParentDto.bloodType,
      nationality: updateParentDto.nationality,
      maritalStatus: updateParentDto.maritalStatus,

      phone: updateParentDto.phone,
      alternatePhone: updateParentDto.alternatePhone,
      address: updateParentDto.address,
      city: updateParentDto.city,
      province: updateParentDto.province,
      country: updateParentDto.country,
      postalCode: updateParentDto.postalCode,

      cnic: updateParentDto.cnic,

      qualification: updateParentDto.qualification,

      occupation: updateParentDto.occupation,
      employer: updateParentDto.employer,
      jobTitle: updateParentDto.jobTitle,
    };

    if (updateParentDto.password) {
      data.password = await bcrypt.hash(
        updateParentDto.password,
        10,
      );
    }

    return this.prisma.parent.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent with ID ${id} not found`,
      );
    }

    return this.prisma.parent.delete({
      where: { id },
    });
  }
}