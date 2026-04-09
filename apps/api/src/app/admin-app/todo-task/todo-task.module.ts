import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TodoTaskController } from './todo-task.controller';
import { TodoTaskService } from './todo-task.service';
import { ScheduleReminderService } from './schedule-reminder.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [ScheduleModule.forRoot(), OrderModule],
  controllers: [TodoTaskController],
  providers: [TodoTaskService, ScheduleReminderService],
})
export class TodoTaskModule {}
