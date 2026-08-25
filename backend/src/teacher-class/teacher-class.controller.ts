import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { TeacherClassService } from './teacher-class.service';
import { CreateTeacherClassDto } from './dto/create-teacher-class.dto';

@Controller('teacher-class')
export class TeacherClassController {
  constructor(
    private readonly teacherClassService: TeacherClassService,
  ) {}

  @Post()
  create(@Body() dto: CreateTeacherClassDto) {
    return this.teacherClassService.create(dto);
  }

  @Get()
  findAll() {
    return this.teacherClassService.findAll();
  }

  @Get('teacher/:teacherId')
  findByTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.teacherClassService.findByTeacher(teacherId);
  }

  @Get('class/:classId')
  findByClass(
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    return this.teacherClassService.findByClass(classId);
  }

  @Delete(':teacherId/:classId')
  remove(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    return this.teacherClassService.remove(
      teacherId,
      classId,
    );
  }
}