import { createEvaluateTaskRequest, createExecuteTaskRequest, performTask } from '../src/test-tools/lib/utils';
import TesterEpf, { Форма } from './__e1c-mocks__/TesterEpf';

const testerEpfMock = new TesterEpf();

describe('Когда производится вычисление', () => {
    it('должен корректно вычислять выражение', async () => {
        const expression = '6*7';
        const result = await performTask(createEvaluateTaskRequest({ expression }));

        expect(result).toBe(42);
    });
});

describe('Когда выполняется код', () => {
    it('должен возвращать результат выполнения', async () => {
        const code = 'Результат = 6*7;';
        const result = await performTask(createExecuteTaskRequest({ code }));

        expect(result).toBe(42);
    });
});

describe('Когда производится выполнение кода доступного только на сервере', () => {
    it('должен возвращать корректный результат на сервере', async () => {
        const code = 'Запрос = Новый Запрос("123"); Результат = Запрос.Текст;';
        const result = await performTask(createExecuteTaskRequest({ code }, true));

        expect(result).toBe('123');
    });
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('должен вызывать исключение на клиенте', async () => {
        const code = 'Запрос = Новый Запрос("123"); Результат = Запрос.Текст;';
        const result = await performTask(createExecuteTaskRequest({ code }));

        expect(result).toBe('123');
    });
});

describe('Когда производится вызов метода доступного только на клиенте', () => {
    it('должен возвращать корректный результат на клиенте', async () => {
        const expression = 'ПолучитьОкна().Количество()';
        const result = await performTask(createEvaluateTaskRequest({ expression }));

        expect(typeof result).toBe('number');
    });
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('должен вызывать исключение на сервере', async () => {
        const expression = 'ПолучитьОкна().Количество()';
        const result = await performTask(createEvaluateTaskRequest({ expression }, true));

        expect(result).toEqual({ 'error': expect.anything() });
    });
});

describe('Когда производится вызов метода формы "Форма"', () => {
    describe('и имя метода "ПодготовитьТелоОтвета"', () => {
        it('должен быть получен объект из входных параметров', async () => {
            const форма = testerEpfMock.ПолучитьФорму(Форма);

            expect(await форма.ПодготовитьТелоОтвета('0000000001', 'Pending')).toBe('{"id":"0000000001","status":"Pending"}');
        });
    });
});

describe('Когда производится конвертация таблицы значений в массив соответствий', () => {
    it('должен вернуть корректное значение', async () => {
        const code = `
            ТЗ = Новый ТаблицаЗначений();
            ТЗ.Колонки.Добавить("Тест1");
            ТЗ.Колонки.Добавить("Тест2");

            Строка = ТЗ.Добавить();
            Строка.Тест1 = 1;
            Строка.Тест2 = 2;

            Строка = ТЗ.Добавить();
            Строка.Тест1 = 3;
            Строка.Тест2 = 4;

            Результат = ТаблицуЗначенийВМассивСоответствий(ТЗ);
        `;
        const result = await performTask(createExecuteTaskRequest({ code }));

        expect(result).toEqual([{ 'Тест1': 1, 'Тест2': 2 }, { 'Тест1': 3, 'Тест2': 4 }]);
    });
});

describe('Когда производится конвертация таблицы значений в массив структур', () => {
    it('должен вернуть корректное значение', async () => {
        const code = `
            ТЗ = Новый ТаблицаЗначений();
            ТЗ.Колонки.Добавить("Тест1");
            ТЗ.Колонки.Добавить("Тест2");

            Строка = ТЗ.Добавить();
            Строка.Тест1 = 1;
            Строка.Тест2 = 2;

            Строка = ТЗ.Добавить();
            Строка.Тест1 = 3;
            Строка.Тест2 = 4;

            Результат = ТаблицуЗначенийВМассивСтруктур(ТЗ);
        `;
        const result = await performTask(createExecuteTaskRequest({ code }));

        expect(result).toEqual([{ 'Тест1': 1, 'Тест2': 2 }, { 'Тест1': 3, 'Тест2': 4 }]);
    });
});

describe('Когда производится сериализация структуры содержащей таблицу значений в JSON', () => {
    it('должен вернуть сериализованную структуру, содержащую сериализованный массив структур', async () => {
        const code = `
            ТЗ = Новый ТаблицаЗначений();
            ТЗ.Колонки.Добавить("Тест1");
            ТЗ.Колонки.Добавить("Тест2");

            Строка = ТЗ.Добавить();
            Строка.Тест1 = 1;
            Строка.Тест2 = 2;

            Строка = ТЗ.Добавить();
            Строка.Тест1 = 3;
            Строка.Тест2 = 4;

            Результат = СериализоватьВJSON(Новый Структура("Таблица", ТЗ));
        `;
        const result = await performTask(createExecuteTaskRequest({ code }));

        expect(result).toEqual('{"Таблица":[{"Тест1":1,"Тест2":2},{"Тест1":3,"Тест2":4}]}');
    });
});
