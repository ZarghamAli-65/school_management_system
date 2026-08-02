import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ParentService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('parents')
// @UseGuards(JwtAuthGuard, RolesGuard) // uncomment when auth is ready
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get()
  // @Roles('admin')
  findAll() {
    return this.parentService.findAll();
  }

  @Get(':id')
  // @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parentService.findOne(id);
  }

  @Post()
  // @Roles('admin')
  create(@Body() createParentDto: CreateParentDto) {
    return this.parentService.create(createParentDto);
  }

  @Put(':id')
  // @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParentDto: UpdateParentDto,
  ) {
    return this.parentService.update(id, updateParentDto);
  }

  @Delete(':id')
  // @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parentService.remove(id);
  }
}