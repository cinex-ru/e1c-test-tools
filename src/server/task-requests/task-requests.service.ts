import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GeneralTaskRequest } from './interfaces/task-request.interface';
import { CreateTaskRequestDto } from './dto/create-task-request.dto';
import { UpdateTaskRequestDto } from './dto/update-task-request.dto';
import { TaskProcessingResultDto } from './dto/task-processing-result.dto';
import { TaskRequestStatusChangedEvent } from './events/task-request.status-changed.event';
import { TaskRequestStatus } from './task-request-status';

@Injectable()
export class TaskRequestsService {
    private readonly taskRequests: { [id: string]: GeneralTaskRequest } = {};
    private id = 0;
    private static readonly idLength = 10;

    // eslint-disable-next-line no-unused-vars
    constructor(private eventEmitter: EventEmitter2) {}

    private getNewId(): string {
        this.id += 1;
        return (this.id).toString().padStart(TaskRequestsService.idLength, '0');
    }

    create(createTaskRequestDto: CreateTaskRequestDto): string {
        const id = this.getNewId();
        this.taskRequests[id] = {
            ...createTaskRequestDto,
            id,
            'status': 'Pending',
            'accepted': new Date(),
        };

        return id;
    }

    update(updateTaskRequestDto: UpdateTaskRequestDto) {
        // eslint-disable-next-line no-undef
        const updateData: Partial<GeneralTaskRequest> = { ...updateTaskRequestDto };
        if (updateData.status === 'Processing') {
            updateData.started = new Date();

            this.eventEmitter.emit(
                'task-request.status-changed',
                new TaskRequestStatusChangedEvent(
                    updateTaskRequestDto.id,
                    'Processing',
                ),
            );
        } else if (updateData.status === 'Finished') {
            updateData.finished = new Date();
            this.eventEmitter.emit(
                'task-request.status-changed',
                new TaskRequestStatusChangedEvent(
                    updateTaskRequestDto.id,
                    'Finished',
                ),
            );
        }
        this.taskRequests[updateTaskRequestDto.id] = { ...this.taskRequests[updateTaskRequestDto.id], ...updateData };
    }

    findOne(id: string): GeneralTaskRequest {
        return this.taskRequests[id];
    }

    findAll(): GeneralTaskRequest[] {
        return Object.values(this.taskRequests)
            .filter((taskRequest) => taskRequest.status !== 'Deleted');
    }

    findAllByStatus(status: TaskRequestStatus): GeneralTaskRequest[] {
        return Object.values(this.taskRequests)
            .filter((taskRequest) => taskRequest.status === status);
    }

    getResult(id: string): TaskProcessingResultDto {
        // eslint-disable-next-line prefer-const
        let { result, status } = this.findOne(id);
        if (status === 'Deleted') {
            result = undefined;
        }
        return { id, result };
    }

    delete(id: string) {
        this.update({ id, 'status': 'Deleted' });
    }
}
