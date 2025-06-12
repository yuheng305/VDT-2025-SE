import { IsString, IsDateString, IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  project_name: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsInt()
  @IsPositive()
  leader_id: number;
}