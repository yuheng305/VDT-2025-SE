import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GoogleAuthGuard } from 'src/auth/utils/Guards';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Get()
    //@UseGuards(GoogleAuthGuard)
    async findAll() {
        return this.taskService.findAll();
    }

    @Post()
    //@UseGuards(GoogleAuthGuard)
    async create(@Body() data: CreateTaskDto) {
        try {
            return await this.taskService.create(data);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
