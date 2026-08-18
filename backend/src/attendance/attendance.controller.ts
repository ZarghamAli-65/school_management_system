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
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('students/mark')
  @Roles(Role.ADMIN, Role.TEACHER)
  markStudentAttendance(
    @Body() dto: MarkStudentAttendanceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attendanceService.markStudentAttendance(
      dto,
      req.user.id,
    );
  }

  @Post('teachers/mark')
  @Roles(Role.ADMIN)
  markTeacherAttendance(
    @Body() dto: MarkTeacherAttendanceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attendanceService.markTeacherAttendance(
      dto,
      req.user.id,
    );
  }

  @Get('students')
  @Roles(Role.ADMIN, Role.TEACHER)
  getStudentAttendance(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.getStudentAttendance(query);
  }

  @Get('teachers')
  @Roles(Role.ADMIN)
  getTeacherAttendance(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.getTeacherAttendance(query);
  }
}