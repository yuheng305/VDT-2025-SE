import { TaskStatus } from '@prisma/client';

export class LateTaskDto {
  taskId: number;
  taskName: string;
  employeeName: string;
  projectName: string;
  projectId: number;
  leaderId: number | null;
  leaderEmail: string | null;
  endDate: Date;
  progress: number;
  status: TaskStatus;
  estimateTime: number;
}