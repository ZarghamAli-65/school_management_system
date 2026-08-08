import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  // Create subject
  async create(dto: CreateSubjectDto) {
    const existingSubject = await this.prisma.subject.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (existingSubject) {
      throw new BadRequestException("Subject name already exists.");
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const subject = await tx.subject.create({
          data: {
            code: dto.code,
            name: dto.name,
            description: dto.description,
          },
        });

        if (dto.teacherIds?.length) {
          await tx.teacherSubject.createMany({
            data: dto.teacherIds.map((teacherId) => ({
              teacherId,
              subjectId: subject.id,
            })),
          });
        }

        return tx.subject.findUnique({
          where: {
            id: subject.id,
          },
          include: {
            teachers: {
              include: {
                teacher: true,
              },
            },
          },
        });
      });
    } catch (error) {
      throw new BadRequestException(
        "Cannot create subject. Please check the subject and teacher details.",
      );
    }
  }

  // Get all subjects
  async findAll() {
    return this.prisma.subject.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }

  // Get one subject
  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException("Subject not found.");
    }

    return subject;
  }

  // Update subject
  async update(id: number, dto: UpdateSubjectDto) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!subject) {
      throw new NotFoundException("Subject not found.");
    }

    if (dto.name) {
      const existingSubject = await this.prisma.subject.findFirst({
        where: {
          name: dto.name,
          NOT: {
            id,
          },
        },
      });

      if (existingSubject) {
        throw new BadRequestException("Subject name already exists.");
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedSubject = await tx.subject.update({
          where: {
            id,
          },
          data: {
            ...(dto.code !== undefined && {
              code: dto.code,
            }),
            ...(dto.name !== undefined && {
              name: dto.name,
            }),
            ...(dto.description !== undefined && {
              description: dto.description,
            }),
          },
        });

        if (dto.teacherIds !== undefined) {
          await tx.teacherSubject.deleteMany({
            where: {
              subjectId: id,
            },
          });

          if (dto.teacherIds.length) {
            await tx.teacherSubject.createMany({
              data: dto.teacherIds.map((teacherId) => ({
                teacherId,
                subjectId: id,
              })),
            });
          }
        }

        return tx.subject.findUnique({
          where: {
            id: updatedSubject.id,
          },
          include: {
            teachers: {
              include: {
                teacher: true,
              },
            },
          },
        });
      });
    } catch (error) {
      throw new BadRequestException(
        "Cannot update subject. Please check the subject and teacher details.",
      );
    }
  }

  // Delete subject
  async remove(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        teachers: true,
        lessons: true,
        exams: true,
        assignments: true,
        results: true,
      },
    });

    if (!subject) {
      throw new NotFoundException("Subject not found.");
    }

    if (
      subject.teachers.length ||
      subject.lessons.length ||
      subject.exams.length ||
      subject.assignments.length ||
      subject.results.length
    ) {
      throw new BadRequestException(
        "Cannot delete subject because it is assigned to other records.",
      );
    }

    await this.prisma.subject.delete({
      where: {
        id,
      },
    });

    return {
      message: "Subject deleted successfully.",
    };
  }
}