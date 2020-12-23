import { TaskRequestStatus } from '../task-request-status';

export class UpdateTaskRequestDto {
    id!: string;
    status!: TaskRequestStatus;
    result?: any;
}
