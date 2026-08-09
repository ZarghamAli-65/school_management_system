import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { UpdateAnnouncementDto } from "./dto/update-announcement.dto";

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.announcement.findMany({
      include: {
        class: true,
      },
      orderBy: {
        publishDate: "desc",
      },
    });
  }

  async findOne(id: number) {
    const announcement =
      await this.prisma.announcement.findUnique({
        where: { id },
        include: {
          class: true,
        },
      });

    if (!announcement) {
      throw new NotFoundException(
        `Announcement with ID ${id} not found`,
      );
    }

    return announcement;
  }

  async create(
    createAnnouncementDto: CreateAnnouncementDto,
  ) {
    try {
      return await this.prisma.announcement.create({
        data: {
          title: createAnnouncementDto.title,
          description: createAnnouncementDto.description,
          classId: createAnnouncementDto.classId ?? null,
        },
        include: {
          class: true,
        },
      });
    } catch (error) {
      console.error("Create announcement error:", error);

      throw new BadRequestException(
        "Failed to create announcement",
      );
    }
  }

  async update(
    id: number,
    updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    await this.findOne(id);

    try {
      return await this.prisma.announcement.update({
        where: { id },
        data: {
          ...(updateAnnouncementDto.title !== undefined && {
            title: updateAnnouncementDto.title,
          }),

          ...(updateAnnouncementDto.description !== undefined && {
            description: updateAnnouncementDto.description,
          }),

          ...(updateAnnouncementDto.classId !== undefined && {
            classId: updateAnnouncementDto.classId,
          }),
        },
        include: {
          class: true,
        },
      });
    } catch (error) {
      console.error("Update announcement error:", error);

      throw new BadRequestException(
        "Failed to update announcement",
      );
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.announcement.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Delete announcement error:", error);

      throw new BadRequestException(
        "Failed to delete announcement",
      );
    }
  }
}