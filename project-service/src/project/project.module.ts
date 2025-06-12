import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskAssignmentModule } from 'src/task-assignment/task-assignment.module';

@Module({
  imports: [PrismaModule, TaskAssignmentModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}