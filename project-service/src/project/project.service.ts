import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskAssignmentService } from 'src/task-assignment/task-assignment.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { LateTaskDto } from './dto/late-task.dto';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

interface TaskDetail {
  id: number;
  task_name: string;
  start_date: Date;
  end_date: Date;
  progress: number;
}

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService, private taskAssignmentService: TaskAssignmentService, private rabbitMQService: RabbitMQService) {}

  async findAll() {
    return this.prisma.project.findMany();
  }

  async create(data: CreateProjectDto) {
    // Kiểm tra các trường bắt buộc
    if (!data.project_name || !data.start_date || !data.end_date || !data.leader_email) {
      throw new BadRequestException('Project name, start date, end date, and leader email are required');
    }

    // Tìm leader bằng email
    const leader = await this.prisma.employee.findUnique({
      where: { email: data.leader_email },
    });

    if (!leader) {
      throw new BadRequestException(`Leader with email ${data.leader_email} not found`);
    }

    // Tạo project
    try {
      const project = await this.prisma.project.create({
        data: {
          project_name: data.project_name,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          project_description: data.project_description || '',
          leader: {
            connect: { id: leader.id },
          },
        },
      });
      console.log('Project created:', project); 
      return {
        message: 'Project created successfully',
        project,
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new BadRequestException(`Failed to create project: ${error.message}`);
    }
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

  async getLateTasks(id: number): Promise<LateTaskDto[]> {
    const currentDate = new Date();
    const whereClause = { task: { project_id: id } };

    const assignments = await this.prisma.taskAssignment.findMany({
      where: whereClause,
      include: {
        task: {
          include: {
            project: {
              include: { leader: true },
            },
          },
        },
        employee: true,
      },
    });

    const lateTasks: LateTaskDto[] = [];
    for (const assignment of assignments) {
      const startDate = new Date(assignment.start_date);
      const endDate = new Date(assignment.end_date);
      let isLate = false;

      if (assignment.progress >= 100) {
        continue; // Bỏ qua task đã hoàn thành
      }

      if (endDate < currentDate) {
        isLate = true; // Quá hạn
      } else if (startDate <= currentDate) {
        const timeElapsed = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60); // Giờ
        const expectedProgress = Math.min((timeElapsed / assignment.estimate_time) * 100, 100); // Giới hạn 100%
        if (assignment.progress < expectedProgress - 20) {
          isLate = true; // Tiến độ chậm
        }
      }

      if (isLate && assignment.task && assignment.task.project) {
        const lateTask: LateTaskDto = {
          taskId: assignment.task_id,
          taskName: assignment.task.task_name,
          employeeName: assignment.employee.displayName,
          projectName: assignment.task.project.project_name,
          projectId: assignment.task.project.id,
          leaderId: assignment.task.project.leader?.id ?? null,
          leaderEmail: null, // Không gửi email leader
          endDate: assignment.end_date,
          progress: assignment.progress,
          status: assignment.status,
          estimateTime: assignment.estimate_time,
        };
        lateTasks.push(lateTask);

        // Gửi message tới RabbitMQ
        // const message = {
        //   taskId: lateTask.taskId,
        //   taskName: lateTask.taskName,
        //   employeeName: lateTask.employeeName,
        //   projectName: lateTask.projectName,
        //   projectId: lateTask.projectId,
        //   leaderId: null, // Không gửi email leader
        //   endDate: lateTask.endDate,
        //   progress: lateTask.progress,
        //   status: lateTask.status,
        //   estimateTime: lateTask.estimateTime,
        // };
        // await this.rabbitMQService.sendToQueue('late-tasks', message);
      }
    }

    return lateTasks;
  }
}