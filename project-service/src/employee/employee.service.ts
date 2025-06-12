import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface ProjectRole {
  id: number;
  project_name: string;
  start_date: Date;
  end_date: Date;
  role: string;
}

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeeById(id: number) {
    return this.prisma.employee.findUnique({
      where: { id: Number(id) },
    });
  }

  async getProjectsByEmployee(id: number) {
    // Tìm employee dựa trên id
    const employee = await this.prisma.employee.findUnique({
      where: { id: Number(id) }, // Sử dụng id trực tiếp, không phải ":id"
      include: {
        taskAssignments: {
          include: {
            task: {
              include: {
                project: true, // Lấy thông tin project từ task
              },
            },
          },
        },
        projectsLed: true, // Lấy các dự án mà employee là leader
      },
    });

    if (!employee) {
      return { message: 'Employee not found', projects: [] };
    }

    // Khai báo mảng projects với kiểu ProjectRole
    const projects: ProjectRole[] = [];

    // Dự án mà employee là leader
    employee.projectsLed.forEach((project) => {
      projects.push({
        id: project.id,
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date,
        role: 'Leader',
      });
    });

    // Dự án mà employee là thành viên (qua task assignments)
    employee.taskAssignments.forEach((assignment) => {
      const project = assignment.task.project;
      // Kiểm tra để tránh trùng lặp nếu employee vừa là leader vừa là member
      if (!projects.some((p) => p.id === project.id)) {
        projects.push({
          id: project.id,
          project_name: project.project_name,
          start_date: project.start_date,
          end_date: project.end_date,
          role: 'Member',
        });
      }
    });

    return {
      message: 'Projects retrieved successfully',
      employee: { id: employee.id, displayName: employee.displayName, email: employee.email },
      projects,
    };
  }
}
