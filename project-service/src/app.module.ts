import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmployeeModule } from './employee/employee.module';
import { PrismaModule } from './prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { TaskAssignmentModule } from './task-assignment/task-assignment.module';
import { NotiConfigModule } from './noti-config/noti-config.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }), EmployeeModule, PrismaModule,
  PassportModule.register({ session: true }),
  ProjectModule,
  TaskModule,
  TaskAssignmentModule,
  NotiConfigModule,ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
