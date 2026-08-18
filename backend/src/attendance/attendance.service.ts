import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkStudentAttendanceDto } from './dto/mark-student-attendance.dto';
import { MarkTeacherAttendanceDto } from './dto/mark-teacher-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async markStudentAttendance(
    dto: MarkStudentAttendanceDto,
    markedById: string,
  ) {
    const { classId, date, students } = dto;

    const classExists = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    if (!students.length) {
      throw new BadRequestException(
        'At least one student attendance record is required',
      );
    }

    const studentIds = students.map((student) => student.studentId);

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

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

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

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

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

  async getStudentAttendance(query: AttendanceQueryDto) {
    const { classId, studentId, date, dateFrom, dateTo, status } = query;

    const where: any = {};

    if (classId !== undefined) {
      where.classId = classId;
    }

    if (studentId !== undefined) {
      where.studentId = studentId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(attendanceDate);
      nextDate.setDate(nextDate.getDate() + 1);

      where.date = {
        gte: attendanceDate,
        lt: nextDate,
      };
    } else if (dateFrom || dateTo) {
      where.date = {};

      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        where.date.gte = from;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.date.lte = to;
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
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(attendanceDate);
      nextDate.setDate(nextDate.getDate() + 1);

      where.date = {
        gte: attendanceDate,
        lt: nextDate,
      };
    } else if (dateFrom || dateTo) {
      where.date = {};

      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        where.date.gte = from;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.date.lte = to;
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