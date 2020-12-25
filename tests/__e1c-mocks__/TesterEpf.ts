/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */

import { resolve } from 'path';
import { createExecuteExternalTaskRequest, performTask } from '../../src/test-tools/lib/utils';

// this comes from generator
const externalBinName = 'tester';
const pathToExternalBinFile = resolve('tests/__e1c-mocks__/tester.epf');
const exportMethodName = 'ЭкспортируемыйМетод';

const performFormMethod = async (formName: string, methodName: string, ...params: any[]): Promise<any> => performTask(
    createExecuteExternalTaskRequest({
        externalBinName,
        formName,
        methodName,
        params,
        pathToExternalBinFile,
        exportMethodName,
    }),
);

export class Форма {
    readonly name = 'Форма';
    async ПодготовитьТелоОтвета(ИдЗадачи: string, СтатусЗадачи: string, Результат?: any): Promise<string> {
        return (await performFormMethod(this.name, 'ПодготовитьТелоОтвета', ИдЗадачи, СтатусЗадачи, Результат)) as string;
    }
}

type FormsOfTesterEpf = Форма;

export default class TesterEpf {
    ПолучитьФорму<T extends FormsOfTesterEpf>(type: { new(): T ;}): T {
        // eslint-disable-next-line new-cap
        return (new type());
    }
}
