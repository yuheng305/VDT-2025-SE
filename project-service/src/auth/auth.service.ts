import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmployeeDetails } from 'src/utils/types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(details: EmployeeDetails) {
    console.log('AuthService');
    console.log(details);

    const employee = await this.prisma.employee.findUnique({
      where: { email: details.email },
    });

    console.log('Employee found:');
    console.log(employee);

    if (employee) return employee;
    console.log('Creating new employee...');
    const newEmployee = await this.prisma.employee.create({
      data: {
        email: details.email,
        displayName: details.displayName,
      },
    });

    return newEmployee;
  }

  async findUser(id: number) {
    const user = await this.prisma.employee.findUnique({
      where: { id },
    });
    return user;
  }
}
