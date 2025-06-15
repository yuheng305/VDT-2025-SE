import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskAssignmentModule } from 'src/task-assignment/task-assignment.module';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Module({
  imports: [PrismaModule, TaskAssignmentModule],
  controllers: [ProjectController],
  providers: [ProjectService, RabbitMQService],
})
export class ProjectModule {}