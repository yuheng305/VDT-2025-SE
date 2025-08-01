import { IsString, IsDateString, IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  task_name: string;

  @IsInt()
  @IsPositive()
  project_id: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

}