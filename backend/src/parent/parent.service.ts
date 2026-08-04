import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import * as bcrypt from 'bcrypt'; // optional, for hashing password

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}

  async create(createParentDto: CreateParentDto) {
    // Hash password before saving (recommended)
    const hashedPassword = await bcrypt.hash(createParentDto.password, 10);
    return this.prisma.parent.create({
      data: {
        ...createParentDto,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.parent.findMany({
      include: { students: true }, // optionally include related students
    });
  }

  async findOne(id: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: { students: true },
    });
    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }
    return parent;
  }

  async update(id: number, updateParentDto: UpdateParentDto) {
    // Check existence
    await this.findOne(id);

    // If password is provided, hash it
    const data: any = { ...updateParentDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.parent.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    // Check existence
    await this.findOne(id);
    return this.prisma.parent.delete({ where: { id } });
  }
}