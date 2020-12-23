import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TaskRequestsModule } from './task-requests/task-requests.module';

@Module({
    'imports': [
        TaskRequestsModule,
        EventEmitterModule.forRoot(),
    ],
    'controllers': [],
    'providers': [],
})
export class AppModule {}
