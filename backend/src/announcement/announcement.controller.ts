import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { AnnouncementService } from "./announcement.service";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { UpdateAnnouncementDto } from "./dto/update-announcement.dto";

@Controller("announcement")
export class AnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
  ) {}

  @Post()
  create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ) {
    return this.announcementService.create(
      createAnnouncementDto,
    );
  }

  @Get()
  findAll() {
    return this.announcementService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.announcementService.findOne(id);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementService.update(
      id,
      updateAnnouncementDto,
    );
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.announcementService.remove(id);
  }
}