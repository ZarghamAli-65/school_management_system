import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { StudentModule } from './student/student.module';
import { ParentModule } from './parent/parent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    StudentModule,
    ParentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
