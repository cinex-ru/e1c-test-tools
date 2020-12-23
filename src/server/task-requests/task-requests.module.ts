import { Module } from '@nestjs/common';
import { TaskRequestsController } from './task-requests.controller';
import { TaskRequestsGateway } from './task-requests.gateway';
import { TaskRequestsService } from './task-requests.service';

@Module({
    'controllers': [TaskRequestsController],
    'providers': [TaskRequestsService, TaskRequestsGateway],
})
export class TaskRequestsModule {}
