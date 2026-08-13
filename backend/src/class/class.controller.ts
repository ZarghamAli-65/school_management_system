// src/class/class.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
  ) {}

  @Post()
  create(
    @Body() createClassDto: CreateClassDto,
  ) {
    return this.classService.create(createClassDto);
  }

  @Get()
  findAll() {
    return this.classService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.classService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classService.update(
      id,
      updateClassDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.classService.remove(id);
  }
}