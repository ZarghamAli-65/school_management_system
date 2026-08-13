import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";

import { SubjectService } from "./subject.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

@Controller("subjects")
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,
  ) {}

  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectService.create(dto);
  }

  @Get()
  findAll() {
    return this.subjectService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.subjectService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, dto);
  }

  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.subjectService.remove(id);
  }
}