/*
  Warnings:

  - Made the column `displayName` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `end_date` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leader_id` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_name` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_name` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "role" TEXT,
ALTER COLUMN "displayName" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "leader_id" INTEGER NOT NULL,
ADD COLUMN     "project_name" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "project_id" INTEGER NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "task_name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "task_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "estimate_time" DOUBLE PRECISION NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "status" "TaskStatus" NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
