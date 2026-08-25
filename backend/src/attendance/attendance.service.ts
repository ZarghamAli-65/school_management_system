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

  private parseAttendanceDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);

    if (!year || !month || !day) {
      throw new BadRequestException(
        'Invalid date format. Expected YYYY-MM-DD',
      );
    }

    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  // =========================
  // MARK STUDENT ATTENDANCE
  // =========================

  async markStudentAttendance(
    dto: MarkStudentAttendanceDto,
    markedById: string,
    role: Role,
  ) {
    const { classId, date, students } = dto;

    const classExists = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    // TEACHER can only mark attendance for assigned classes
    if (role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: {
          userId: markedById,
        },
      });

      if (!teacher) {
        throw new NotFoundException(
          'Teacher profile not found for the logged-in user',
        );
      }

      const assignedClass = await this.prisma.teacherClass.findUnique({
        where: {
          teacherId_classId: {
            teacherId: teacher.id,
            classId,
          },
        },
      });

      if (!assignedClass) {
        throw new BadRequestException(
          'You are not assigned to this class',
        );
      }
    }

    if (!students.length) {
      throw new BadRequestException(
        'At least one student attendance record is required',
      );
    }

    const studentIds = students.map(
      (student) => student.studentId,
    );

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
        `Some students do not belong to the selected class: ${invalidStudentIds.join(', ')}`,
      );
    }

    const attendanceDate = this.parseAttendanceDate(date);

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

    const attendance = await this.prisma.$transaction(operations);

    return {
      message: 'Student attendance saved successfully',
      data: attendance,
    };
  }

  // =========================
  // MARK TEACHER ATTENDANCE
  // =========================

  async markTeacherAttendance(
    dto: MarkTeacherAttendanceDto,
    markedById: string,
  ) {
    const { teacherId, date, status, remarks } = dto;

    const teacherExists = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacherExists) {
      throw new NotFoundException('Teacher not found');
    }

    const attendanceDate = this.parseAttendanceDate(date);

    const attendance = await this.prisma.teacherAttendance.upsert({
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

  // =========================
  // GET STUDENT ATTENDANCE
  // =========================

  async getStudentAttendance(
    query: AttendanceQueryDto,
    userId: string,
    role: Role,
  ) {
    const { classId, studentId, date, dateFrom, dateTo, status } =
      query;

    const where: any = {};

    // TEACHER can only view attendance for assigned classes
    if (role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: {
          userId,
        },
      });

      if (!teacher) {
        throw new NotFoundException(
          'Teacher profile not found for the logged-in user',
        );
      }

      const assignedClasses = await this.prisma.teacherClass.findMany({
        where: {
          teacherId: teacher.id,
        },
        select: {
          classId: true,
        },
      });

      const assignedClassIds = assignedClasses.map(
        (assignment) => assignment.classId,
      );

      if (!assignedClassIds.length) {
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
    } else if (classId !== undefined) {
      where.classId = classId;
    }

    if (studentId !== undefined) {
      where.studentId = studentId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (date) {
      const attendanceDate = this.parseAttendanceDate(date);

      const nextDate = new Date(attendanceDate);
      nextDate.setDate(nextDate.getDate() + 1);

      where.date = {
        gte: attendanceDate,
        lt: nextDate,
      };
    } else if (dateFrom || dateTo) {
      where.date = {};

      if (dateFrom) {
        where.date.gte =
          this.parseAttendanceDate(dateFrom);
      }

      if (dateTo) {
        const to = this.parseAttendanceDate(dateTo);
        to.setDate(to.getDate() + 1);

        where.date.lt = to;
      }
    }

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
      orderBy: {
        date: 'desc',
      },
    });
  }

  // =========================
  // GET TEACHER ATTENDANCE
  // =========================

  async getTeacherAttendance(query: AttendanceQueryDto) {
    const { teacherId, date, dateFrom, dateTo, status } = query;

    const where: any = {};

    if (teacherId !== undefined) {
      where.teacherId = teacherId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (date) {
      const attendanceDate = this.parseAttendanceDate(date);

      const nextDate = new Date(attendanceDate);
      nextDate.setDate(nextDate.getDate() + 1);

      where.date = {
        gte: attendanceDate,
        lt: nextDate,
      };
    } else if (dateFrom || dateTo) {
      where.date = {};

      if (dateFrom) {
        where.date.gte =
          this.parseAttendanceDate(dateFrom);
      }

      if (dateTo) {
        const to = this.parseAttendanceDate(dateTo);
        to.setDate(to.getDate() + 1);

        where.date.lt = to;
      }
    }

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
      orderBy: {
        date: 'desc',
      },
    });
  }
}