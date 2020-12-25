import { createEvaluateTaskRequest, createExecuteTaskRequest, performTask } from '../src/test-tools/lib/utils';
import TesterEpf, { Форма } from './__e1c-mocks__/TesterEpf';

const testerEpfMock = new TesterEpf();

describe('Когда производится вычисление', () => {
    it('должно корректно вычислять выражение', async () => {
        const expression = '6*7';
        const result = await performTask(createEvaluateTaskRequest({ expression }));

        expect(result).toBe(42);
    });
});

describe('Когда выполняется код', () => {
    it('должно возвращать результат выполнения', async () => {
        const code = 'Результат = 6*7;';
        const result = await performTask(createExecuteTaskRequest({ code }));

        expect(result).toBe(42);
    });
});

describe('Когда производится выполнение кода доступного только на сервере', () => {
    it('должно возвращать корректный результат на сервере', async () => {
        const code = 'Запрос = Новый Запрос("123"); Результат = Запрос.Текст;';
        const result = await performTask(createExecuteTaskRequest({ code }, true));

        expect(result).toBe('123');
    });
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('должно вызывать исключение на клиенте', async () => {
        const code = 'Запрос = Новый Запрос("123"); Результат = Запрос.Текст;';
        const result = await performTask(createExecuteTaskRequest({ code }));

        expect(result).toBe('123');
    });
});

describe('Когда производится вызов метода доступного только на клиенте', () => {
    it('должно возвращать корректный результат на клиенте', async () => {
        const expression = 'ПолучитьОкна().Количество()';
        const result = await performTask(createEvaluateTaskRequest({ expression }));

        expect(typeof result).toBe('number');
    });
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('должно вызывать исключение на сервере', async () => {
        const expression = 'ПолучитьОкна().Количество()';
        const result = await performTask(createEvaluateTaskRequest({ expression }, true));

        expect(result).toEqual({ 'error': expect.anything() });
    });
});

describe('Когда производится вызов метода формы "Форма"', () => {
    describe('и имя метода "ПолучитьТелоОтвета"', () => {
        it('должен быть получен объект из входных параметров', async () => {
            const форма = testerEpfMock.ПолучитьФорму(Форма);

            expect(await форма.ПодготовитьТелоОтвета('0000000001', 'Pending')).toBe('{"id":"0000000001","status":"Pending"}');
        });
    });
});
