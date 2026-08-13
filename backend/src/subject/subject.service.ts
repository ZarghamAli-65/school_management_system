import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE
  // =========================
  async create(dto: CreateSubjectDto) {
    const existingSubject = await this.prisma.subject.findFirst({
      where: {
        OR: [
          {
            name: dto.name,
          },
          {
            code: dto.code,
          },
        ],
      },
    });

    if (existingSubject) {
      throw new BadRequestException(
        'Subject name or code already exists.',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const subject = await tx.subject.create({
          data: {
            code: dto.code,
            name: dto.name,
            shortName: dto.shortName,
            description: dto.description,
            gradeLevel: dto.gradeLevel,
            category: dto.category,
          },
        });

        // TeacherSubject relation
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
            classSchedules: true,
            exams: true,
            assignments: true,
            results: true,
          },
        });
      });
    } catch (error) {
      console.error('Create subject error:', error);

      throw new BadRequestException(
        'Cannot create subject. Please check the subject and teacher details.',
      );
    }
  }

  // =========================
  // FIND ALL
  // =========================
  async findAll() {
    return this.prisma.subject.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      include: {
        teachers: {
          include: {
            teacher: true,
          },
        },

        classSchedules: true,
        exams: true,
        assignments: true,
        results: true,
      },
    });
  }

  // =========================
  // FIND ONE
  // =========================
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

        classSchedules: true,
        exams: true,
        assignments: true,
        results: true,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        `Subject with ID ${id} not found.`,
      );
    }

    return subject;
  }

  // =========================
  // UPDATE
  // =========================
  async update(
    id: number,
    dto: UpdateSubjectDto,
  ) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        `Subject with ID ${id} not found.`,
      );
    }

    // Check duplicate name
    if (dto.name !== undefined) {
      const existingByName =
        await this.prisma.subject.findFirst({
          where: {
            name: dto.name,
            NOT: {
              id,
            },
          },
        });

      if (existingByName) {
        throw new BadRequestException(
          'Subject name already exists.',
        );
      }
    }

    // Check duplicate code
    if (dto.code !== undefined) {
      const existingByCode =
        await this.prisma.subject.findFirst({
          where: {
            code: dto.code,
            NOT: {
              id,
            },
          },
        });

      if (existingByCode) {
        throw new BadRequestException(
          'Subject code already exists.',
        );
      }
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const updatedSubject =
            await tx.subject.update({
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

                ...(dto.shortName !== undefined && {
                  shortName: dto.shortName,
                }),

                ...(dto.description !== undefined && {
                  description: dto.description,
                }),

                ...(dto.gradeLevel !== undefined && {
                  gradeLevel: dto.gradeLevel,
                }),

                ...(dto.category !== undefined && {
                  category: dto.category,
                }),
              },
            });

          // Update TeacherSubject relation
          if (dto.teacherIds !== undefined) {
            await tx.teacherSubject.deleteMany({
              where: {
                subjectId: id,
              },
            });

            if (dto.teacherIds.length) {
              await tx.teacherSubject.createMany({
                data: dto.teacherIds.map(
                  (teacherId) => ({
                    teacherId,
                    subjectId: id,
                  }),
                ),
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

              classSchedules: true,
              exams: true,
              assignments: true,
              results: true,
            },
          });
        },
      );
    } catch (error) {
      console.error('Update subject error:', error);

      throw new BadRequestException(
        'Cannot update subject. Please check the subject and teacher details.',
      );
    }
  }

  // =========================
  // DELETE
  // =========================
  async remove(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        id,
      },

      include: {
        teachers: true,
        classSchedules: true,
        exams: true,
        assignments: true,
        results: true,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        `Subject with ID ${id} not found.`,
      );
    }

    // Prevent deletion when subject is already
    // connected with other records.
    if (
      subject.teachers.length > 0 ||
      subject.classSchedules.length > 0 ||
      subject.exams.length > 0 ||
      subject.assignments.length > 0 ||
      subject.results.length > 0
    ) {
      throw new BadRequestException(
        'Cannot delete subject because it is assigned to other records.',
      );
    }

    await this.prisma.subject.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Subject deleted successfully.',
    };
  }
}