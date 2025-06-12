import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.task.findMany({
            include: {
                project: true,
            },
        });
    }

    async create(data: CreateTaskDto) {
        if (!data.task_name || !data.project_id || !data.start_date || !data.end_date) {
            throw new Error('Missing required fields');
        }

        return this.prisma.task.create({
            data: {
                task_name: data.task_name,
                project_id: data.project_id,
                start_date: new Date(data.start_date),
                end_date: new Date(data.end_date),
            },
        });
    }

    async updateTaskProgress(taskId: number) {
        const assignments = await this.prisma.taskAssignment.findMany({
        where: { task_id: taskId },
        });

        if (!assignments.length) {
        await this.prisma.task.update({
            where: { id: taskId },
            data: { progress: 0 },
        });
        return;
        }

        const totalEstimateTime = assignments.reduce((sum, a) => sum + a.estimate_time, 0);
        const weightedProgress = assignments.reduce(
        (sum, a) => sum + (a.progress * a.estimate_time) / 100,
        0,
        );
        const progress = totalEstimateTime > 0 ? (weightedProgress / totalEstimateTime) * 100 : 0;

        await this.prisma.task.update({
        where: { id: taskId },
        data: { progress: Number(progress.toFixed(2)) },
        });
    }
}
