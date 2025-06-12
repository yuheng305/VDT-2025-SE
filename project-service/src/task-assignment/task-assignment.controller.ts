import { Body, Controller, Get, Patch, Param, Delete, Post } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { UpdateAssignmentData } from './task-assignment.service';
import { TaskAssignmentService } from './task-assignment.service';

@Controller('task-assignment')
export class TaskAssignmentController {
    constructor(private readonly taskAssignmentService: TaskAssignmentService) {}

    @Get()
    async findAll() {
        return this.taskAssignmentService.findAll();
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body() data: UpdateAssignmentData) {
        if (Object.keys(data).length === 0) {
        throw new BadRequestException('No data provided for update');
        }
        return this.taskAssignmentService.update(Number(id), data);
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        return this.taskAssignmentService.delete(Number(id));
    }

    @Post('notification-config')
    async updateNotificationConfig(
        @Body() body: { leaderId: number; email: string; frequency: string; sendAlert: boolean },
    ) {
        await this.taskAssignmentService.updateNotificationConfig(
        body.leaderId,
        body.email,
        body.frequency,
        body.sendAlert,
        );
        return { message: 'Notification config sent to Notification Service' };
    }

}
