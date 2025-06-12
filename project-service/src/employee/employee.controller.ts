import { Controller, Get, Param, UseGuards, Res} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { GoogleAuthGuard } from 'src/auth/utils/Guards';
import { Response } from 'express';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get(':id')
  //@UseGuards(GoogleAuthGuard)
  getEmployee(@Param('id') id: number) {
    return this.employeeService.getEmployeeById(id);
  }

  @Get(':id/projects')
  async getProjectsByEmployee(@Param('id') id: number, @Res() res: Response) {
    const result = await this.employeeService.getProjectsByEmployee(id);
    res.status(200).json(result);
  }
}
