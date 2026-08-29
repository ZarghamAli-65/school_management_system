import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { Role } from '@prisma/client';

import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { MarkStudentAttendanceDto } from './dto/mark-student-attendance.dto';
import { MarkTeacherAttendanceDto } from './dto/mark-teacher-attendance.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}

  // ============================================================
  // STUDENT ATTENDANCE - MARK
  //
  // ADMIN:
  //   Can mark/edit any student's attendance.
  //
  // TEACHER:
  //   Can mark/edit students from assigned classes only.
  //
  // STUDENT:
  //   Cannot mark attendance.
  //
  // PARENT:
  //   Cannot mark attendance.
  // ============================================================

  @Post('students/mark')
  @Roles(Role.ADMIN, Role.TEACHER)
  markStudentAttendance(
    @Body() dto: MarkStudentAttendanceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attendanceService.markStudentAttendance(
      dto,
      req.user.id,
      req.user.role,
    );
  }

  // ============================================================
  // TEACHER ATTENDANCE - MARK
  //
  // ADMIN ONLY
  //
  // Admin can mark/edit attendance for any teacher.
  //
  // TEACHER:
  //   Cannot mark teacher attendance.
  // ============================================================

  @Post('teachers/mark')
  @Roles(Role.ADMIN)
  markTeacherAttendance(
    @Body() dto: MarkTeacherAttendanceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attendanceService.markTeacherAttendance(
      dto,
      req.user.id,
      req.user.role,
    );
  }

  // ============================================================
  // STUDENT ATTENDANCE - VIEW
  //
  // ADMIN:
  //   All attendance.
  //
  // TEACHER:
  //   Assigned classes only.
  //
  // STUDENT:
  //   Own attendance only.
  //
  // PARENT:
  //   Own child's attendance only.
  // ============================================================

  @Get('students')
  @Roles(
    Role.ADMIN,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
  )
  getStudentAttendance(
    @Query() query: AttendanceQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attendanceService.getStudentAttendance(
      query,
      req.user.id,
      req.user.role,
    );
  }

  // ============================================================
  // TEACHER ATTENDANCE - VIEW
  //
  // ADMIN:
  //   Can view all teacher attendance.
  //
  // TEACHER:
  //   Can view own attendance only.
  //
  // STUDENT:
  //   Cannot view teacher attendance.
  //
  // PARENT:
  //   Cannot view teacher attendance.
  // ============================================================

  @Get('teachers')
  @Roles(Role.ADMIN, Role.TEACHER)
  getTeacherAttendance(
    @Query() query: AttendanceQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attendanceService.getTeacherAttendance(
      query,
      req.user.id,
      req.user.role,
    );
  }
}

