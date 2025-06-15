import { Module } from '@nestjs/common';
import { TaskAssignmentService } from './task-assignment.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskAssignmentController } from './task-assignment.controller';
import { TaskService } from 'src/task/task.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { TaskAssignmentCron } from './task-assignment.cron';
import { ProjectService } from 'src/project/project.service';

@Module({
  controllers: [TaskAssignmentController],
  providers: [TaskAssignmentService, PrismaService, TaskService, RabbitMQService, TaskAssignmentCron, ProjectService],
  exports: [TaskAssignmentService],
})
export class TaskAssignmentModule {}