import { Controller, Post, Get, Body, Param, UploadedFile, UseInterceptors, ParseIntPipe, BadRequestException, UseGuards, Res} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectService } from './project.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateProjectDto } from './dto/create-project.dto';
import { GoogleAuthGuard } from 'src/auth/utils/Guards';
import { Response } from 'express';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @UseGuards(GoogleAuthGuard)
  async findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  // @UseGuards(GoogleAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const project = await this.projectService.findAll();
    const foundProject = project.find((p) => p.id === id);
    if (!foundProject) {
      throw new BadRequestException(`Project with ID ${id} not found`);
    }
    return foundProject;
  }

  @Post()
  @UseGuards(GoogleAuthGuard)
  async create(@Body() data: CreateProjectDto) {
    if (!data.project_name || !data.start_date || !data.end_date || !data.leader_id) {
    try {
      return await this.projectService.create(data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  }

  @Post(':projectId/import-tasks')
  // @UseGuards(GoogleAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv|xlsx)$/)) {
          return cb(new BadRequestException('Only CSV or Excel (.xlsx) files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async importTasks(
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.projectService.importTasks(projectId, file);
  }

  @Get(':id/tasks')
  async getTasksByProject(@Param('id') id: number, @Res() res: Response) {
    const result = await this.projectService.getTasksByProject(id);
    res.status(200).json(result);
  }

  @Get(':id/task-assignments')
  // @UseGuards(GoogleAuthGuard)
  async getTaskAssignmentsByProject(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const project = await this.projectService.getTaskAssignmentsByProject(id);
    if (!project) {
      throw new BadRequestException(`No task assignments found for project ID ${id}`);
    }
    res.status(200).json({
      message: 'Task assignments retrieved successfully',
      project_id: id,
      task_assignments: project,
    });

}
}