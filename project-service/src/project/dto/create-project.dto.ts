import { IsString, IsDateString, IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  project_name: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsString()
  @IsNotEmpty()
  leader_email: string;

  @IsString()
  project_description?: string;
}