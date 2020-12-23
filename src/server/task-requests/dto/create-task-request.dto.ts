import { TaskRequestParameterMap } from '../interfaces/task-request.interface';

export class CreateTaskRequestDto {
    type!: keyof TaskRequestParameterMap;
    parameters!: TaskRequestParameterMap[keyof TaskRequestParameterMap];
    performOnServer?: boolean
}
