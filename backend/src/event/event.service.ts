// event.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    const { eventDate, startTime, endTime, ...rest } = createEventDto;
    return this.prisma.event.create({
      data: {
        ...rest,
        eventDate: new Date(eventDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      include: {
        class: true,
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      include: {
        class: true,
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        class: true,
      },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id);

    const { eventDate, startTime, endTime, ...rest } = updateEventDto;
    const data: any = { ...rest };
    if (eventDate) data.eventDate = new Date(eventDate);
    if (startTime) data.startTime = new Date(startTime);
    if (endTime) data.endTime = new Date(endTime);

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        class: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.event.delete({
      where: { id },
    });
  }
}