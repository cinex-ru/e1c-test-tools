/* eslint-disable no-use-before-define */
import { TaskRequestStatus } from '../task-request-status';

export interface TaskRequest<T extends TaskRequestType> {
    id: string;
    type: T;
    parameters: TaskRequestParameterMap[T];
    performOnServer?: boolean
    status: TaskRequestStatus;
    accepted?: Date;
    started?: Date;
    finished?: Date;
    result?: any;
}

export interface GeneralTaskRequest {
    id: string;
    type: TaskRequestType;
    parameters: TaskRequestParameterMap[keyof TaskRequestParameterMap];
    status: TaskRequestStatus;
    accepted?: Date;
    started?: Date;
    finished?: Date;
    result?: any;
}

export type TaskRequestParameterMap ={
    'Execute': ParametersExecute
    'Evaluate': ParametersEvaluate
    'Management': ParametersManagement
    'ExecuteExternal': ParametersExecuteExternal
}

export type TaskRequestType = keyof TaskRequestParameterMap

export interface ParametersManagement {
    command: string
}

export interface ParametersExecute {
    code: string
}

export interface ParametersEvaluate {
    expression: string
}

interface ParametersExecuteExternal {
    externalBinName: string
    formName?: string
    methodName: string
    params: any[]
    pathToExternalBinFile: string
    exportMethodName: string
}
