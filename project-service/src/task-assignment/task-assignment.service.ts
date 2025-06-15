import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { TaskStatus } from '@prisma/client';
import { z } from 'zod';
import { TaskService } from '../task/task.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

// Định nghĩa schema cho dữ liệu từ CSV/Excel
const RowSchema = z.object({
  Task: z.string().min(1, 'Task name is required'),
  'Assigned To': z.string().email('Invalid email format for Assigned To'),
  'Start Date': z.union([z.string(), z.number()]).refine((val) => {
    const date = new Date(typeof val === 'number' ? val : val);
    return !isNaN(date.getTime());
  }, { message: 'Invalid Start Date' }),
  'Due Date': z.union([z.string(), z.number()]).refine((val) => {
    const date = new Date(typeof val === 'number' ? val : val);
    return !isNaN(date.getTime());
  }, { message: 'Invalid Due Date' }),
  'Estimate Time': z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return z.number().refine((n) => !isNaN(n) && n > 0, 'Estimate Time must be a positive number').parse(num);
  }),
  Progress: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return z.number().refine((n) => !isNaN(n) && n >= 0 && n <= 100, 'Progress must be a number between 0 and 100').parse(num);
  }),
  Status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BEHIND_SCHEDULE'], {
    errorMap: () => ({ message: `Status must be one of ${Object.values(TaskStatus).join(', ')}` }),
  }),
});

// Interface cho dữ liệu đã parse
interface AssignmentData {
  task_name: string;
  employee_email: string;
  start_date: Date;
  due_date: Date;
  estimate_time: number;
  progress: number;
  status: TaskStatus;
}

// Interface cho dữ liệu patch
interface UpdateAssignmentData {
  start_date?: Date;
  due_date?: Date;
  estimate_time?: number;
  progress?: number;
  status?: TaskStatus;
}

@Injectable()
export class TaskAssignmentService {
  constructor(private prisma: PrismaService, private taskService: TaskService, private rabbitMQService: RabbitMQService) {}

  async findAll() {
    return this.prisma.taskAssignment.findMany({
      include: {
        task: true,
        employee: true,
      },
    });
  }

  async importTaskAssignments(projectId: number, file: Express.Multer.File) {
    const assignments: AssignmentData[] = [];

    // Kiểm tra định dạng file
    const isCsv = file.originalname.endsWith('.csv');
    const isExcel = file.originalname.endsWith('.xlsx');

    if (!isCsv && !isExcel) {
      throw new BadRequestException('Only CSV or Excel (.xlsx) files are allowed');
    }

    // Xử lý file CSV
    if (isCsv) {
      const parser = fs
        .createReadStream(file.path)
        .pipe(parse({ columns: true, skip_empty_lines: true }));

      for await (const row of parser) {
        try {
          const validatedRow = RowSchema.parse(row);
          assignments.push({
            task_name: validatedRow.Task,
            employee_email: validatedRow['Assigned To'],
            start_date: new Date(validatedRow['Start Date']),
            due_date: new Date(validatedRow['Due Date']),
            estimate_time: validatedRow['Estimate Time'],
            progress: validatedRow.Progress,
            status: validatedRow.Status,
          });
        } catch (error) {
          throw new BadRequestException(`Invalid row data: ${error.message}`);
        }
      }
    }

    // Xử lý file Excel
    if (isExcel) {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { raw: false }); // Giữ định dạng text

      for (const row of rows) {
        try {
          const validatedRow = RowSchema.parse(row);
          assignments.push({
            task_name: validatedRow.Task,
            employee_email: validatedRow['Assigned To'],
            start_date: new Date(validatedRow['Start Date']),
            due_date: new Date(validatedRow['Due Date']),
            estimate_time: validatedRow['Estimate Time'],
            progress: validatedRow.Progress,
            status: validatedRow.Status,
          });
        } catch (error) {
          throw new BadRequestException(`Invalid row data: ${error.message}`);
        }
      }
    }

    if (assignments.length === 0) {
      throw new BadRequestException('File is empty');
    }

    // Kiểm tra project tồn tại
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new BadRequestException(`Project with ID ${projectId} not found`);
    }

    // Xử lý import từng assignment
    let assignmentCount = 0;
    for (const assignmentData of assignments) {
      // Kiểm tra employee tồn tại
      if (!assignmentData.employee_email || assignmentData.employee_email.trim() === '') {
        throw new BadRequestException(`Invalid employee email: ${assignmentData.employee_email} is empty or undefined`);
      }
      const employee = await this.prisma.employee.findUnique({
        where: {
          email: assignmentData.employee_email,
        },
      });
      if (!employee) {
        throw new BadRequestException(`Employee with email ${assignmentData.employee_email} not found`);
      }

      // Kiểm tra hoặc tạo task
      let task = await this.prisma.task.findFirst({
        where: {
          task_name: assignmentData.task_name,
          project_id: projectId,
        },
      });

      if (!task) {
        task = await this.prisma.task.create({
          data: {
            task_name: assignmentData.task_name,
            start_date: assignmentData.start_date,
            end_date: assignmentData.due_date,
            project_id: projectId,
          },
        });
      }

      // Kiểm tra xem TaskAssignment đã tồn tại chưa
      const existingAssignment = await this.prisma.taskAssignment.findFirst({
        where: {
          task_id: task.id,
          employee_id: employee.id,
        },
      });

      if (existingAssignment) {
        // Cập nhật nếu đã tồn tại
        await this.prisma.taskAssignment.update({
          where: { id: existingAssignment.id },
          data: {
            start_date: assignmentData.start_date,
            end_date: assignmentData.due_date,
            estimate_time: assignmentData.estimate_time,
            progress: assignmentData.progress,
            status: assignmentData.status,
            updatedAt: new Date(),
          },
        });
        await this.taskService.updateTaskProgress(task.id); // Cập nhật progress sau khi cập nhật
      } else {
        // Tạo mới TaskAssignment
        await this.prisma.taskAssignment.create({
          data: {
            task_id: task.id,
            employee_id: employee.id,
            start_date: assignmentData.start_date,
            end_date: assignmentData.due_date,
            estimate_time: assignmentData.estimate_time,
            progress: assignmentData.progress,
            status: assignmentData.status,
          },
        });
        await this.taskService.updateTaskProgress(task.id); // Cập nhật progress sau khi tạo
      }

      assignmentCount++;
    }

    // Xóa file tạm
    fs.unlinkSync(file.path);

    return { message: 'Task assignments imported successfully', assignmentCount };
  }

  async update(id: number, data: UpdateAssignmentData) {
    const existingAssignment = await this.prisma.taskAssignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      throw new BadRequestException(`Task assignment with ID ${id} not found`);
    }

    const updatedData: any = {};
    if (data.start_date) updatedData.start_date = data.start_date;
    if (data.due_date) updatedData.due_date = data.due_date;
    if (data.estimate_time) updatedData.estimate_time = data.estimate_time;
    if (data.progress) updatedData.progress = data.progress;
    if (data.status) updatedData.status = data.status;
    updatedData.updatedAt = new Date();

    const updatedAssignment = await this.prisma.taskAssignment.update({
      where: { id },
      data: updatedData,
    });
    await this.taskService.updateTaskProgress(updatedAssignment.task_id); // Cập nhật progress sau khi cập nhật
    return updatedAssignment;
  }

  async delete(id: number) {
    const existingAssignment = await this.prisma.taskAssignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      throw new BadRequestException(`Task assignment with ID ${id} not found`);
    }

    await this.prisma.taskAssignment.delete({
      where: { id },
    });
    await this.taskService.updateTaskProgress(existingAssignment.task_id); // Cập nhật progress sau khi xóa
    return { message: `Task assignment with ID ${id} deleted successfully` };
  }

  async updateTaskAssignmentStatus() {
    const currentDate = new Date();
    const assignments = await this.prisma.taskAssignment.findMany({
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

    // Gom task chậm theo projectId
    const lateTasksByProject: { [key: number]: { projectName: string; tasks: any[] } } = {};

    for (const assignment of assignments) {
      let newStatus: TaskStatus = assignment.status;
      const startDate = new Date(assignment.start_date);
      const endDate = new Date(assignment.end_date);

      // Cập nhật status
      if (assignment.progress >= 100) {
        newStatus = TaskStatus.COMPLETED;
      } else if (startDate <= currentDate && assignment.progress < 100) {
        newStatus = TaskStatus.IN_PROGRESS;
      } else if (startDate > currentDate) {
        newStatus = TaskStatus.PENDING;
      }

      let isLate = false;

      if (assignment.progress >= 100) {
        continue; // Bỏ qua task đã hoàn thành
      }

      if (endDate < currentDate) {
        isLate = true; // Quá hạn
        newStatus = TaskStatus.BEHIND_SCHEDULE; 
      } else if (startDate <= currentDate) {
        const timeElapsed = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60); // Giờ
        const expectedProgress = Math.min((timeElapsed / assignment.estimate_time) * 100, 100); // Giới hạn 100%
        if (assignment.progress < expectedProgress - 20) {
          isLate = true; // Tiến độ chậm
          newStatus = TaskStatus.BEHIND_SCHEDULE;
        }
      }

      // Cập nhật status vào database
      if (newStatus !== assignment.status) {
        await this.prisma.taskAssignment.update({
          where: { id: assignment.id },
          data: { status: newStatus },
        });
      }

      // Gom task chậm
      if (isLate && assignment.task.project) {
        const projectId = assignment.task.project.id;
        if (!lateTasksByProject[projectId]) {
          lateTasksByProject[projectId] = {
            projectName: assignment.task.project.project_name,
            tasks: [],
          };
        }
        lateTasksByProject[projectId].tasks.push({
          taskId: assignment.task_id,
          taskName: assignment.task.task_name,
          projectName: assignment.task.project.project_name,
          employeeName: assignment.employee.displayName,
          projectId: assignment.task.project.id,
          endDate: assignment.end_date,
          progress: assignment.progress,
          status: newStatus,
          estimateTime: assignment.estimate_time,
        });
      }
    }

    // Gửi message gộp cho mỗi project
    for (const projectId in lateTasksByProject) {
      const { projectName, tasks } = lateTasksByProject[projectId];
      if (tasks.length > 0) {
        const message = {
          projectId: parseInt(projectId),
          projectName,
          tasks,
        };
        console.log('Sending late-tasks message:', message);
        await this.rabbitMQService.sendToQueue('late-tasks', message);
      }
    }
  }

  async updateNotificationConfig(projectId: number, email: string, frequency: string, sendAlert: boolean) {
    const config = {
      projectId,
      email,
      frequency,
      sendAlert,
    };
    await this.rabbitMQService.sendToQueue('config-updates', config);
  }
}

export { AssignmentData, UpdateAssignmentData }; // Export interfaces for potential use in other modules