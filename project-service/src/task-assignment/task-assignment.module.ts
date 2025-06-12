import { Module } from '@nestjs/common';
import { TaskAssignmentService } from './task-assignment.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskAssignmentController } from './task-assignment.controller';
import { TaskService } from 'src/task/task.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { TaskAssignmentCron } from './task-assignment.cron';

@Module({
  controllers: [TaskAssignmentController],
  providers: [TaskAssignmentService, PrismaService, TaskService, RabbitMQService, TaskAssignmentCron],
  exports: [TaskAssignmentService],
})
export class TaskAssignmentModule {}