import { io } from 'socket.io-client';
import { CreateTaskRequestDto } from '../../server/task-requests/dto/create-task-request.dto';
import { TaskProcessingResultDto } from '../../server/task-requests/dto/task-processing-result.dto';
import { UpdateTaskRequestDto } from '../../server/task-requests/dto/update-task-request.dto';
import { TaskRequestParameterMap, TaskRequestType } from '../../server/task-requests/interfaces/task-request.interface';

export const sleep = (ms: number) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

export const performTask = (taskRequest: CreateTaskRequestDto): Promise<TaskProcessingResultDto> => {
    const brokerHost = process.env.BROKER_HOST || '127.0.0.1';
    const brokerPort = process.env.BROKER_PORT || 3000;
    let taskId: string;

    return new Promise<TaskProcessingResultDto>((resolve, reject) => {
        const socket = io(`http://${brokerHost}:${brokerPort}`, { 'transports': ['websocket', 'polling'] });
        socket.on('connect', () => {
            socket.emit('task-requests', taskRequest);
        });

        socket.on('task-requests', (data: { id: string }) => {
            taskId = data.id;
        });

        socket.on('task-statuses', (data: UpdateTaskRequestDto) => {
            if (data.id === taskId) {
                if (data.status === 'Finished') {
                    socket.emit('task-results', { 'id': taskId });
                }
            }
        });

        socket.on('task-results', (data: TaskProcessingResultDto) => {
            socket.disconnect();
            resolve(data.result);
        });

        socket.on('error', (error: Error) => {
            reject(error);
        });
    });
};

// eslint-disable-next-line no-unused-vars
export type CreateTaskRequest<T extends TaskRequestType> = (params: TaskRequestParameterMap[T], performOnServer?: boolean) => CreateTaskRequestDto;

export const createEvaluateTaskRequest: CreateTaskRequest<'Evaluate'> = (parameters, performOnServer = false) => ({
    'type': 'Evaluate',
    parameters,
    performOnServer,
});

export const createExecuteTaskRequest: CreateTaskRequest<'Execute'> = (parameters, performOnServer = false) => ({
    'type': 'Execute',
    parameters,
    performOnServer,
});

export const createManagementTaskRequest: CreateTaskRequest<'Management'> = (parameters, performOnServer = false) => ({
    'type': 'Management',
    parameters,
    performOnServer,
});

export const createExecuteExternalTaskRequest: CreateTaskRequest<'ExecuteExternal'> = (parameters, performOnServer = false) => ({
    'type': 'ExecuteExternal',
    parameters,
    performOnServer,
});
