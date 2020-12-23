import { TaskRequestStatus } from '../task-request-status';

export class TaskRequestStatusChangedEvent {
    id: string;
    status: string;
    result: any;

    constructor(id: string, status: TaskRequestStatus) {
        this.id = id;
        this.status = status;
    }
}
