import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TeacherModule } from './teacher/teacher.module';
import configuration from './config/configuration';
import { StudentModule } from './student/student.module';
import { ParentModule } from './parent/parent.module';
import { ClassModule } from './class/class.module';
import { SubjectModule } from './subject/subject.module';
import { LessonModule } from './lesson/lesson.module';
import { AssignmentModule } from './assignment/assignment.module';
import { ExamModule } from './exam/exam.module';
import { ResultModule } from './result/result.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { EventModule } from './event/event.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TeacherClassModule } from './teacher-class/teacher-class.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    StudentModule,
    TeacherModule,
    ParentModule,
    ClassModule,
    SubjectModule,
    LessonModule,
    AssignmentModule,
    AnnouncementModule,
    ExamModule,
    ResultModule,
    EventModule,
    AttendanceModule,
    TeacherClassModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}