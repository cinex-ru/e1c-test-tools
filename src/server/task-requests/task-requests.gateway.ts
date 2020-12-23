import { Logger } from '@nestjs/common';
import {
    ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateTaskRequestDto } from './dto/create-task-request.dto';
import { TaskRequestsService } from './task-requests.service';
import { TaskRequestStatusChangedEvent } from './events/task-request.status-changed.event';

@WebSocketGateway()
export class TaskRequestsGateway {
    @WebSocketServer()
    server!: Server

    private logger = new Logger('TaskRequestsGateway');

    // eslint-disable-next-line no-unused-vars
    constructor(private taskRequestsService: TaskRequestsService) {}

    @SubscribeMessage('task-requests')
    handleTaskRequest(@MessageBody() createTaskRequestDto: CreateTaskRequestDto, @ConnectedSocket() client: Socket) {
        const id = this.taskRequestsService.create({ ...createTaskRequestDto });
        client.emit('task-requests', { id });
    }

    @SubscribeMessage('task-results')
    handleTaskResult(@MessageBody() { id }: { id: string }, @ConnectedSocket() client: Socket) {
        client.emit('task-results', this.taskRequestsService.getResult(id));
    }

    @OnEvent('task-request.status-changed')
    handleTaskRequestStatusChanged(event: TaskRequestStatusChangedEvent) {
        this.server.emit('task-statuses', { 'id': event.id, 'status': event.status });
    }
}
