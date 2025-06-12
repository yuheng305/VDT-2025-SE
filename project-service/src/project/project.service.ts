import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskAssignmentService } from 'src/task-assignment/task-assignment.service';
import { CreateProjectDto } from './dto/create-project.dto';

interface TaskDetail {
  id: number;
  task_name: string;
  start_date: Date;
  end_date: Date;
  progress: number;
}

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService, private taskAssignmentService: TaskAssignmentService) {}

  async findAll() {
    return this.prisma.project.findMany();
  }

  async create(data: CreateProjectDto) {
    if (!data.project_name || !data.start_date || !data.end_date || !data.leader_id) {
      throw new BadRequestException('Missing required fields: project_name, start_date, end_date, or leader_id');
    }

    // Kiểm tra xem leader_id có tồn tại trong bảng Employee không
    const leader = await this.prisma.employee.findUnique({
      where: { id: data.leader_id },
    });
    if (!leader) {
      throw new BadRequestException(`Leader with ID ${data.leader_id} not found`);
    }

    return this.prisma.project.create({
      data: {
        project_name: data.project_name,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        leader_id: data.leader_id,
      },
    });
  }

  async importTasks(projectId: number, file: Express.Multer.File) {
    return this.taskAssignmentService.importTaskAssignments(projectId, file);
  }

  async getTasksByProject(projectId: number) {
    const tasks = await this.prisma.task.findMany({
      where: { project_id: Number(projectId) },
    });

    return {
      message: 'Tasks retrieved successfully',
      project_id: projectId,
      tasks, // Progress đã được lưu sẵn trong database
    };
  }

  async getTaskAssignmentsByProject(projectId: number) {
    const taskAssignments = await this.prisma.taskAssignment.findMany({
      where: { task: { project_id: Number(projectId) } },
      include: {
        task: true,
        employee: true,
      },
    });

    // if (taskAssignments.length === 0) {
    //   throw new BadRequestException(`No task assignments found for project ID ${projectId}`);
    // }

    return taskAssignments.map((assignment) => ({
      id: assignment.id,
      task_name: assignment.task.task_name,
      employee_email: assignment.employee.email,
      start_date: assignment.start_date,
      due_date: assignment.end_date,
      estimate_time: assignment.estimate_time,
      progress: assignment.progress,
      status: assignment.status,
    }));
  }
}