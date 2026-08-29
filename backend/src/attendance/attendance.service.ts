import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { MarkStudentAttendanceDto } from './dto/mark-student-attendance.dto';
import { MarkTeacherAttendanceDto } from './dto/mark-teacher-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // DATE HELPER
  // ============================================================

  private parseAttendanceDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);

    if (
      !year ||
      !month ||
      !day ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw new BadRequestException(
        'Invalid date format. Expected YYYY-MM-DD',
      );
    }

    const parsedDate = new Date(
      Date.UTC(year, month - 1, day, 0, 0, 0, 0),
    );

    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new BadRequestException('Invalid attendance date');
    }

    return parsedDate;
  }

  // ============================================================
  // MARK STUDENT ATTENDANCE
  //
  // ADMIN   -> any class
  // TEACHER -> assigned classes only
  // STUDENT -> blocked
  // PARENT  -> blocked
  // ============================================================

  async markStudentAttendance(
    dto: MarkStudentAttendanceDto,
    markedById: string,
    role: Role,
  ) {
    const { classId, date, students } = dto;

    if (!students || students.length === 0) {
      throw new BadRequestException(
        'At least one student attendance record is required',
      );
    }

    if (role !== Role.ADMIN && role !== Role.TEACHER) {
      throw new BadRequestException(
        'You are not allowed to mark student attendance',
      );
    }

    const classExists = await this.prisma.class.findUnique({
      where: {
        id: classId,
      },
      select: {
        id: true,
      },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    // ==========================================================
    // IMPORTANT:
    // ONLY TEACHER IS SUBJECT TO ASSIGNED-CLASS CHECK.
    //
    // ADMIN SKIPS THIS ENTIRE BLOCK.
    // Therefore ADMIN can mark ANY existing class.
    // ==========================================================

    if (role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: {
          userId: markedById,
        },
        select: {
          id: true,
        },
      });

      if (!teacher) {
        throw new NotFoundException(
          'Teacher profile not found for the logged-in user',
        );
      }

      const assignedClass =
        await this.prisma.teacherClass.findUnique({
          where: {
            teacherId_classId: {
              teacherId: teacher.id,
              classId,
            },
          },
          select: {
            teacherId: true,
            classId: true,
          },
        });

      if (!assignedClass) {
        throw new BadRequestException(
          'You are not assigned to this class',
        );
      }
    }

    // ==========================================================
    // DUPLICATE STUDENT IDs
    // ==========================================================

    const studentIds = students.map(
      (student) => student.studentId,
    );

    const uniqueStudentIds = new Set(studentIds);

    if (uniqueStudentIds.size !== studentIds.length) {
      throw new BadRequestException(
        'Duplicate student attendance records are not allowed',
      );
    }

    // ==========================================================
    // VERIFY STUDENTS BELONG TO SELECTED CLASS
    // ==========================================================

    const classStudents = await this.prisma.student.findMany({
      where: {
        id: {
          in: studentIds,
        },
        classId,
      },
      select: {
        id: true,
      },
    });

    const validStudentIds = new Set(
      classStudents.map((student) => student.id),
    );

    const invalidStudentIds = studentIds.filter(
      (studentId) => !validStudentIds.has(studentId),
    );

    if (invalidStudentIds.length > 0) {
      throw new BadRequestException(
        `Some students do not belong to the selected class: ${invalidStudentIds.join(
          ', ',
        )}`,
      );
    }

    const attendanceDate =
      this.parseAttendanceDate(date);

    // ==========================================================
    // SAVE / UPDATE
    // ==========================================================

    const operations = students.map((student) =>
      this.prisma.studentAttendance.upsert({
        where: {
          studentId_date: {
            studentId: student.studentId,
            date: attendanceDate,
          },
        },

        update: {
          status: student.status,
          remarks: student.remarks,
          classId,
          markedById,
        },

        create: {
          studentId: student.studentId,
          classId,
          date: attendanceDate,
          status: student.status,
          remarks: student.remarks,
          markedById,
        },
      }),
    );

    const attendance =
      await this.prisma.$transaction(operations);

    return {
      message: 'Student attendance saved successfully',
      data: attendance,
    };
  }

  // ============================================================
  // MARK TEACHER ATTENDANCE
  //
  // ADMIN ONLY
  // ============================================================

  async markTeacherAttendance(
    dto: MarkTeacherAttendanceDto,
    markedById: string,
    role: Role,
  ) {
    if (role !== Role.ADMIN) {
      throw new BadRequestException(
        'Only admin can mark teacher attendance',
      );
    }

    const {
      teacherId,
      date,
      status,
      remarks,
    } = dto;

    const teacherExists =
      await this.prisma.teacher.findUnique({
        where: {
          id: teacherId,
        },
        select: {
          id: true,
        },
      });

    if (!teacherExists) {
      throw new NotFoundException('Teacher not found');
    }

    const attendanceDate =
      this.parseAttendanceDate(date);

    const attendance =
      await this.prisma.teacherAttendance.upsert({
        where: {
          teacherId_date: {
            teacherId,
            date: attendanceDate,
          },
        },

        update: {
          status,
          remarks,
          markedById,
        },

        create: {
          teacherId,
          date: attendanceDate,
          status,
          remarks,
          markedById,
        },
      });

    return {
      message: 'Teacher attendance saved successfully',
      data: attendance,
    };
  }

  // ============================================================
  // GET STUDENT ATTENDANCE
  //
  // ADMIN:
  //   All students / selected class
  //
  // TEACHER:
  //   Assigned classes only
  //
  // STUDENT:
  //   Own attendance only
  //
  // PARENT:
  //   Own children's attendance only
  // ============================================================

  async getStudentAttendance(
    query: AttendanceQueryDto,
    userId: string,
    role: Role,
  ) {
    const {
      classId,
      studentId,
      date,
      dateFrom,
      dateTo,
      status,
    } = query;

    const where: any = {};

    // ==========================================================
    // ADMIN
    // ==========================================================

    if (role === Role.ADMIN) {
      if (classId !== undefined) {
        where.classId = classId;
      }

      if (studentId !== undefined) {
        where.studentId = studentId;
      }
    }

    // ==========================================================
    // TEACHER
    // ==========================================================

    if (role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!teacher) {
        throw new NotFoundException(
          'Teacher profile not found for the logged-in user',
        );
      }

      const assignedClasses =
        await this.prisma.teacherClass.findMany({
          where: {
            teacherId: teacher.id,
          },
          select: {
            classId: true,
          },
        });

      const assignedClassIds =
        assignedClasses.map(
          (assignment) => assignment.classId,
        );

      if (assignedClassIds.length === 0) {
        return [];
      }

      if (
        classId !== undefined &&
        !assignedClassIds.includes(classId)
      ) {
        throw new BadRequestException(
          'You are not assigned to this class',
        );
      }

      where.classId =
        classId !== undefined
          ? classId
          : {
              in: assignedClassIds,
            };

      if (studentId !== undefined) {
        where.studentId = studentId;
      }
    }

    // ==========================================================
    // STUDENT
    // ==========================================================

    if (role === Role.STUDENT) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          email: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          'Logged-in user not found',
        );
      }

      const student =
        await this.prisma.student.findUnique({
          where: {
            email: user.email,
          },
          select: {
            id: true,
          },
        });

      if (!student) {
        throw new NotFoundException(
          'Student profile not found for the logged-in user',
        );
      }

      where.studentId = student.id;

      if (classId !== undefined) {
        where.classId = classId;
      }
    }

    // ==========================================================
    // PARENT
    // ==========================================================

    if (role === Role.PARENT) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          email: true,
        },
      });

      if (!user?.email) {
        throw new NotFoundException(
          'Parent account email not found',
        );
      }

      const parent =
        await this.prisma.parent.findUnique({
          where: {
            email: user.email,
          },
          select: {
            id: true,
          },
        });

      if (!parent) {
        throw new NotFoundException(
          'Parent profile not found for the logged-in user',
        );
      }

      where.student = {
        parentId: parent.id,
      };

      if (classId !== undefined) {
        where.classId = classId;
      }
    }

    // ==========================================================
    // STATUS
    // ==========================================================

    if (status !== undefined) {
      where.status = status;
    }

    // ==========================================================
    // EXACT DATE
    // ==========================================================

    if (date) {
      const attendanceDate =
        this.parseAttendanceDate(date);

      const nextDate =
        new Date(attendanceDate);

      nextDate.setUTCDate(
        nextDate.getUTCDate() + 1,
      );

      where.date = {
        gte: attendanceDate,
        lt: nextDate,
      };
    }

    // ==========================================================
    // DATE RANGE
    // ==========================================================

    else if (dateFrom || dateTo) {
      where.date = {};

      if (dateFrom) {
        where.date.gte =
          this.parseAttendanceDate(dateFrom);
      }

      if (dateTo) {
        const to =
          this.parseAttendanceDate(dateTo);

        to.setUTCDate(
          to.getUTCDate() + 1,
        );

        where.date.lt = to;
      }
    }

    // ==========================================================
    // FETCH
    // ==========================================================

    return this.prisma.studentAttendance.findMany({
      where,

      include: {
        student: true,
        class: true,

        markedBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: [
        {
          date: 'desc',
        },
        {
          studentId: 'asc',
        },
      ],
    });
  }

  // ============================================================
  // GET TEACHER ATTENDANCE
  //
  // ADMIN:
  //   All teachers / selected teacher
  //
  // TEACHER:
  //   OWN attendance ONLY
  //
  // STUDENT / PARENT:
  //   Blocked
  // ============================================================

  async getTeacherAttendance(
    query: AttendanceQueryDto,
    userId: string,
    role: Role,
  ) {
    const {
      teacherId,
      date,
      dateFrom,
      dateTo,
      status,
    } = query;

    const where: any = {};

    // ==========================================================
    // ADMIN
    // ==========================================================

    if (role === Role.ADMIN) {
      if (teacherId !== undefined) {
        const teacherExists =
          await this.prisma.teacher.findUnique({
            where: {
              id: teacherId,
            },
            select: {
              id: true,
            },
          });

        if (!teacherExists) {
          throw new NotFoundException(
            'Teacher not found',
          );
        }

        where.teacherId = teacherId;
      }
    }

    // ==========================================================
    // TEACHER
    //
    // IMPORTANT:
    // Frontend teacherId is completely ignored.
    // Logged-in teacher is always the source of truth.
    // ==========================================================

    if (role === Role.TEACHER) {
      const loggedInTeacher =
        await this.prisma.teacher.findUnique({
          where: {
            userId,
          },
          select: {
            id: true,
          },
        });

      if (!loggedInTeacher) {
        throw new NotFoundException(
          'Teacher profile not found for the logged-in user',
        );
      }

      where.teacherId =
        loggedInTeacher.id;
    }

    // ==========================================================
    // OTHER ROLES
    // ==========================================================

    if (
      role !== Role.ADMIN &&
      role !== Role.TEACHER
    ) {
      throw new BadRequestException(
        'You are not allowed to view teacher attendance',
      );
    }

    // ==========================================================
    // STATUS
    // ==========================================================

    if (status !== undefined) {
      where.status = status;
    }

    // ==========================================================
    // EXACT DATE
    // ==========================================================

    if (date) {
      const attendanceDate =
        this.parseAttendanceDate(date);

      const nextDate =
        new Date(attendanceDate);

      nextDate.setUTCDate(
        nextDate.getUTCDate() + 1,
      );

      where.date = {
        gte: attendanceDate,
        lt: nextDate,
      };
    }

    // ==========================================================
    // DATE RANGE
    // ==========================================================

    else if (dateFrom || dateTo) {
      where.date = {};

      if (dateFrom) {
        where.date.gte =
          this.parseAttendanceDate(dateFrom);
      }

      if (dateTo) {
        const to =
          this.parseAttendanceDate(dateTo);

        to.setUTCDate(
          to.getUTCDate() + 1,
        );

        where.date.lt = to;
      }
    }

    // ==========================================================
    // FETCH
    // ==========================================================

    return this.prisma.teacherAttendance.findMany({
      where,

      include: {
        teacher: true,

        markedBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: [
        {
          date: 'desc',
        },
        {
          teacherId: 'asc',
        },
      ],
    });
  }
}