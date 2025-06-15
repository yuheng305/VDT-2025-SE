import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskAssignmentService } from './task-assignment.service';

@Injectable()
export class TaskAssignmentCron {
  constructor(private taskAssignmentService: TaskAssignmentService) {}

  @Cron(CronExpression.EVERY_WEEK) // Chạy mỗi phút để gần với "thời gian thực"
  async handleCron() {
    console.log('Checking task assignments...');
    await this.taskAssignmentService.updateTaskAssignmentStatus();
  }
}