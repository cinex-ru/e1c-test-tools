#Область Общие

////////////////////////////////////////////////////////////////////////////////
// ОБЩИЕ
//

Процедура Пауза(Длительность)
    СтрокаЗапроса = "ping -n 1 -w "+Формат(Длительность, "ЧДЦ=0; ЧГ=") + " 127.255.255.255";
    WshShell = Новый COMОбъект("WScript.Shell");
    WshShell.Run(СтрокаЗапроса, 0, -1);
КонецПроцедуры

&НаКлиенте
Функция _СтрСоединить(МассивСтрок, Разделитель = "")
	Результат = "";

	Для Каждого Элемент Из МассивСтрок Цикл
		Подстрока = ?(ТипЗнч(Элемент) = Тип("Строка"), Элемент, Строка(Элемент));
		РазделительПодстрок = ?(ПустаяСтрока(Результат), "", Разделитель);
		Результат = Результат + РазделительПодстрок + Подстрока;
	КонецЦикла;

	Возврат Результат;
КонецФункции

&НаКлиенте
Функция _СтрРазделить(Строка, Разделитель = ",", ПропускатьПустыеСтроки = Истина)
	Возврат СтроковыеФункцииКлиентСервер.РазложитьСтрокуВМассивПодстрок(Строка, Разделитель, ПропускатьПустыеСтроки);
КонецФункции

&НаКлиенте
Функция _СтрШаблон(Знач СтрокаПодстановки,
	Параметр1, Параметр2 = Неопределено, Параметр3 = Неопределено,
	Параметр4 = Неопределено, Параметр5 = Неопределено, Параметр6 = Неопределено,
	Параметр7 = Неопределено, Параметр8 = Неопределено, Параметр9 = Неопределено)

	Возврат СтроковыеФункцииКлиентСервер.ПодставитьПараметрыВСтроку(СтрокаПодстановки,
		Параметр1, Параметр2, Параметр3, Параметр4, Параметр5, Параметр6, Параметр7, Параметр8, Параметр9);
КонецФункции

&НаКлиенте
Функция ПодставитьПараметрыВСтрокуИзМассива(Знач ШаблонСтроки, Знач Параметры)
	Результат = ШаблонСтроки;

	Индекс = Параметры.Количество();
	Пока Индекс > 0 Цикл
		Значение = Параметры[Индекс-1];
		Результат = СтрЗаменить(Результат, "%" + Формат(Индекс, "ЧГ="), Значение);
		Индекс = Индекс - 1;
	КонецЦикла;

	Возврат СокрЛП(Результат);
КонецФункции

#КонецОбласти

#Область Взаимодействие_с_REST_интерфейсом

////////////////////////////////////////////////////////////////////////////////
// Взаимодействие с REST интерфейсом

// Конвертирует таблицу значений в массив соответствий
//
// Параметры:
//  Таблица				- ТаблицаЗначений	- Таблица для конвертации
//
// Возвращаемое значение:
//	Массив		- Полученный массив соответствий
//
&НаКлиенте
Функция ТаблицуЗначенийВМассивСоответствий(Таблица)
	Результат = Новый Массив;

	Для каждого Строка Из Таблица Цикл
		СоответствиеСтроке = Новый Соответствие;
		Для каждого Колонка Из Таблица.Колонки Цикл
			СоответствиеСтроке.Вставить(Колонка.Имя, Строка[Колонка.Имя]);
		КонецЦикла;
		Результат.Добавить(СоответствиеСтроке);
	КонецЦикла;

	Возврат Результат;
КонецФункции

// Сериализует значение в строку в формате JSON
//
// Параметры:
//  Значение				- Произвольное	- Значение для сериализации
//
// Возвращаемое значение:
//	Строка		- Сериализованное значение
//
&НаКлиенте
Функция СериализоватьВJSON(Значение)
    ЗначениеДляКонвертации = Значение;
    Если ТипЗнч(ЗначениеДляКонвертации) = Тип("ТаблицаЗначений") Тогда
        ЗначениеДляКонвертации = ТаблицуЗначенийВМассивСоответствий(Значение);
    КонецЕсли;

    ПараметрыЗаписи = Новый ПараметрыЗаписиJSON(ПереносСтрокJSON.Нет,, Истина);
	ЗаписьJSON = Новый ЗаписьJSON();
    ЗаписьJSON.УстановитьСтроку(ПараметрыЗаписи);
    ЗаписатьJSON(ЗаписьJSON, ЗначениеДляКонвертации);
    Возврат ЗаписьJSON.Закрыть();
КонецФункции

// Получает значение из строки JSON
//
// Параметры:
//  Строка					- Строка	- Строка JSON
//
// Возвращаемое значение:
//	Произвольное значение	- Значение десериализованное из строки JSON
//
&НаКлиенте
Функция ПолучитьЗначениеИзСтрокиJSON(Строка)
	Результат = Неопределено;

	ЧтениеJSON = Новый ЧтениеJSON();
    ЧтениеJSON.УстановитьСтроку(Строка);
	Результат = ПрочитатьJSON(ЧтениеJSON);
    ЧтениеJSON.Закрыть();

    Возврат Результат;
КонецФункции

// Возвращает HTTPСоединение с сервером для соответствующих параметров
//
// Параметры:
//  Хост								- Строка	- Хост для соединения
//  Порт								- Число		- Порт для соединения
//  Пользователь						- Строка	- Имя пользователя
//	Пароль								- Строка	- Пароль
//	ИспользоватьЗащищенноеСоединение	- Булево	- Признак использования защищенного соединения
//
// Возвращаемое значение:
//	HTTPСоединение			- Соединение с сервером GLPI
//
&НаКлиенте
Функция ПолучитьHTTPСоединение(Хост, Порт = Неопределено, Пользователь = Неопределено, Пароль = Неопределено, ИспользоватьЗащищенноеСоединение = Ложь)
	ЗащищенноеСоединение = ?(ИспользоватьЗащищенноеСоединение, Новый ЗащищенноеСоединениеOpenSSL, Неопределено);
	Возврат Новый HTTPСоединение(Хост, Порт, Пользователь, Пароль,, 20, ЗащищенноеСоединение);
КонецФункции

// Возвращает строковое представление параметра (пример для ключ и значение "field" и 15 соответственно: "field=15")
//
// Параметры:
//	Ключ		- Строка		- Ключ параметра
//	Значение	- Произвольное  - Значение параметра
//
// Возвращаемое значение:
//	Строка		- Строковое представление параметра
//
&НаКлиенте
Функция ПолучитьПредставлениеПараметра(Ключ, Значение)
	Результат = "";

	Если ТипЗнч(Значение) = Тип("Массив") Тогда
		МассивПараметров = Новый Массив;
		Для Индекс = 0 По Значение.Количество() - 1 Цикл
			КлючСИндексом = _СтрШаблон("%1[%2]", Ключ, Индекс);
			МассивПараметров.Добавить(ПолучитьПредставлениеПараметра(КлючСИндексом, Значение[Индекс]));
		КонецЦикла;
		Результат = _СтрСоединить(МассивПараметров, "&");
	ИначеЕсли ТипЗнч(Значение) = Тип("Структура") Тогда
		МассивПараметров = Новый Массив;
		Для каждого КлючЗначение Из Значение Цикл
			КлючСКлючом = _СтрШаблон("%1[%2]", Ключ, КлючЗначение.Ключ);
			МассивПараметров.Добавить(ПолучитьПредставлениеПараметра(КлючСКлючом, КлючЗначение.Значение));
		КонецЦикла;
		Результат = _СтрСоединить(МассивПараметров, "&");
	Иначе
		Если ТипЗнч(Значение) = Тип("Дата") Тогда
			ПредставлениеЗначения = Формат(Значение, "ДФ=yyyy-MM-ddTHH:mm:ss");
		ИначеЕсли ТипЗнч(Значение) = Тип("Число") Тогда
			ПредставлениеЗначения = Формат(Значение, "ЧРД=.; ЧГ=0");
		ИначеЕсли ТипЗнч(Значение) = Тип("Булево") Тогда
			ПредставлениеЗначения = Формат(Значение, "БЛ=false; БИ=true");
		Иначе
			ПредставлениеЗначения = Строка(Значение);
		КонецЕсли;
		Результат = _СтрШаблон("%1=%2", Ключ, ПредставлениеЗначения);
	КонецЕсли;

	Возврат Результат;
КонецФункции

// Возвращает строку параметров для переданных параметров
//
// Параметры:
//	ПараметрыЗапроса   	- Структура	- Параметры HTTP запроса
//
// Возвращаемое значение:
//  Строка				- Строка параметров.
//
&НаКлиенте
Функция ПолучитьСтрокуПараметров(ПараметрыЗапроса)
	Результат = "";

	Если ЗначениеЗаполнено(ПараметрыЗапроса) Тогда
		ТекущийСимвол = "?";
		Для каждого Параметр Из ПараметрыЗапроса Цикл
			Результат = Результат + _СтрШаблон("%1%2", ТекущийСимвол, ПолучитьПредставлениеПараметра(Параметр.Ключ, Параметр.Значение));
			ТекущийСимвол = "&";
		КонецЦикла
	КонецЕсли;

	Возврат Результат;
КонецФункции

// Возвращает HTTPЗапрос для определенного ресурса на сервере
//
// Параметры:
//	АдресРесурса		- Строка		- Строка http-ресурса, к которому будет отправлен запрос
//	Заголовки      		- Соответствие	- Заголовки запроса
//	Куки				- Строка		- Строка cookies
//	ПараметрыЗапроса	- Структура		- Параметры запроса
//	ТелоЗапроса    		- Строка		- Тело запроса в виде строки
//
// Возвращаемое значение:
//  HTTPЗапрос			- Запрос для определенного ресурса.
//
&НаКлиенте
Функция ПолучитьHTTPЗапрос(АдресРесурса = "/", Знач Заголовки = Неопределено, Куки = Неопределено, ПараметрыЗапроса = Неопределено, ТелоЗапроса = Неопределено)
	Если Заголовки = Неопределено Тогда
		Заголовки = Новый Соответствие;
	КонецЕсли;
	Если ЗначениеЗаполнено(Куки) Тогда
		Заголовки.Вставить("Access-Control-Allow-Credentials", Истина);
		Заголовки.Вставить("Cookie", Куки);
	КонецЕсли;

	СтрокаЗапроса = АдресРесурса + ПолучитьСтрокуПараметров(ПараметрыЗапроса);

	HTTPЗапрос = Новый HTTPЗапрос(СтрокаЗапроса, Заголовки);
	Если ЗначениеЗаполнено(ТелоЗапроса) Тогда
		Если Заголовки.Получить("Content-Type") = Неопределено Тогда
			Заголовки.Вставить("Content-Type", "application/json; charset=UTF-8");
		КонецЕсли;

		Если ТипЗнч(ТелоЗапроса) = Тип("Строка") Тогда
			ТелоЗапросаСтрока = ТелоЗапроса;
		Иначе
			ТелоЗапросаСтрока = СериализоватьВJSON(ТелоЗапроса);
		КонецЕсли;

		HTTPЗапрос.УстановитьТелоИзСтроки(ТелоЗапросаСтрока, КодировкаТекста.UTF8, ИспользованиеByteOrderMark.НеИспользовать);
	КонецЕсли;

	Возврат HTTPЗапрос;
КонецФункции

// Возвращает обработанное тело ответа
//
// Параметры:
//	ТелоОтвета 		- Поток		- Тело ответа
//	MIMEТипДанных	- Строка	- MIME тип данных
//	Кодировка		- Строка, КодировкаТекста		- Кодировка тела ответа
//
// Возвращаемое значение:
//  Произвольный	- Полученные данные, тип зависит от переданного MIME типа,
//						а также в зависимости от того что будет десериализовано из JSON.
//
&НаКлиенте
Функция ПолучитьДанныеТелаОтвета(ТелоОтвета, MIMEТипДанных, Кодировка = Неопределено)
	Если Кодировка = Неопределено Тогда
		Кодировка = КодировкаТекста.UTF8;
	КонецЕсли;
	Результат = Неопределено;

	Если ТелоОтвета.ДоступноЧтение Тогда
		Если НРег(Лев(MIMEТипДанных, 16)) = "application/json" Тогда
			ЧтениеJSON = Новый ЧтениеJSON();
			ЧтениеJSON.ОткрытьПоток(ТелоОтвета, Кодировка);
			Результат = ПрочитатьJSON(ЧтениеJSON, Истина);
			ЧтениеJSON.Закрыть();
		ИначеЕсли НРег(Лев(MIMEТипДанных, 4)) = "text" Тогда
			ЧтениеТекста = Новый ЧтениеТекста();
			ЧтениеТекста.Открыть(ТелоОтвета, Кодировка);
			Результат = ЧтениеТекста.Прочитать();
			ЧтениеТекста.Закрыть();
		Иначе  // FIXME: кусок не работающего кода после иначе!!!
			// для больших файлов нужно переписать, но в данном случае они не предполагаются
			Размер = ТелоОтвета.Размер();
			БуферДанных = Новый БуферДвоичныхДанных(Размер);
			ТелоОтвета.Прочитать(БуферДанных, 0, Размер);
			Результат = БуферДанных;
		КонецЕсли;
	КонецЕсли;

	Возврат Результат;
КонецФункции

// Возвращает структуру разобранного ответа на запрос к серверу
//
// Параметры:
//	Ответ			- HTTPОтвет						- Ответ на запрос к серверу
//	Кодировка		- Строка, КодировкаТекста		- Кодировка тела ответа
//
// Возвращаемое значение:
//  Структура		- Запрос для определенного ресурса.
//		* Успешно				- Булево		- Успешность выполнения запроса
//		* КодСостояния			- Число			- Код состояния (ответа) сервера
//		* Заголовки				- Соответствие  - Заголовки ответа
//		* ТелоОтвета			- Строка		- Тело ответа сервера
//		* РазмерТелаОтвета		- Число			- Размер тела ответа сервера
//		* СообщениеОбОшибке		- Булево		- Строка сообщения об ошибке (Неопределено, если запрос выполнен успешно)
//
&НаКлиенте
Функция ОбработатьОтветСервера(Ответ, Кодировка = Неопределено)
	Результат = Новый Структура("Успешно, КодСостояния, Заголовки, ТелоОтвета, РазмерТелаОтвета, СообщениеОбОшибке", Ложь);
	Если Кодировка = Неопределено Тогда
		Кодировка = КодировкаТекста.UTF8;
	КонецЕсли;

	Результат.КодСостояния = Ответ.КодСостояния;
	Результат.Заголовки = Ответ.Заголовки;

	MIMEТипДанных = Ответ.Заголовки.Получить("Content-Type");
	ТелоОтвета = Ответ.ПолучитьТелоКакПоток();
	Результат.ТелоОтвета = ПолучитьДанныеТелаОтвета(ТелоОтвета, MIMEТипДанных, Кодировка);
	Если ТелоОтвета.ДоступноЧтение Тогда
		Результат.РазмерТелаОтвета = ТелоОтвета.Размер();
	Иначе
		Результат.РазмерТелаОтвета = 0;
	КонецЕсли;

	Результат.Успешно = Результат.КодСостояния < 300;
	Если Не Результат.Успешно Тогда
		Если ТипЗнч(Результат.ТелоОтвета) = Тип("Массив") Тогда
			Результат.СообщениеОбОшибке = _СтрШаблон("[%3] %1 (%2)", Результат.ТелоОтвета[1], Результат.ТелоОтвета[0], Ответ.КодСостояния);
		Иначе
			Результат.СообщениеОбОшибке = _СтрШаблон(НСтр("ru = '[%1] Неизвестная ошибка'", ОбщегоНазначенияКлиентСервер.КодОсновногоЯзыка()), Ответ.КодСостояния);
		КонецЕсли;
	КонецЕсли;

	Возврат Результат;
КонецФункции

#КонецОбласти

#Область Обработка_задач

&НаКлиенте
Функция ВыполнитьЗадачу(ТипЗадачи, ПараметрыЗадачи)
    Если ТипЗадачи = "Management" Тогда
        Возврат ВыполнитьЗадачуУправления(ПараметрыЗадачи);
    ИначеЕсли ТипЗадачи = "Evaluate" Тогда
        Возврат Вычислить(ПараметрыЗадачи.Получить("expression"));
    ИначеЕсли ТипЗадачи = "Execute" Тогда
        Результат = Неопределено;
        Выполнить(ПараметрыЗадачи.Получить("code"));
        Возврат Результат;
    ИначеЕсли ТипЗадачи = "ExecuteExternal" Тогда
        ОбъектОписанияЗащиты = Новый ОписаниеЗащитыОтОпасныхДействий;
        ОбъектОписанияЗащиты.ПредупреждатьОбОпасныхДействиях = Ложь;
        ВнешняяОбработка = ВнешниеОбработки.Создать(ПараметрыЗадачи.Получить("pathToExternalBinFile"), Ложь, ОбъектОписанияЗащиты);
        ИмяФормыВнешнейОбработки= ПараметрыЗадачи.Получить("formName");
        ИспользуемыйОбъект = ВнешняяОбработка.ЭтотОбъект;
        Если ИмяФормыВнешнейОбработки <> Неопределено Тогда
            ИспользуемыйОбъект = ИспользуемыйОбъект.ПолучитьФорму(ВнешняяОбработка.Метаданные().ПолноеИмя() + ".Форма." + ИмяФормыВнешнейОбработки);
        КонецЕсли;
        ИмяЭкспортируемогоМетода = ПараметрыЗадачи.Получить("exportMethodName");
        ИмяМетода = ПараметрыЗадачи.Получить("methodName");
        ПараметрыМетода = ПараметрыЗадачи.Получить("params");
        Результат = Неопределено;
        Выполнить("Результат = ИспользуемыйОбъект." + ИмяЭкспортируемогоМетода + "(ИмяМетода, ПараметрыМетода);");
        Возврат Результат;
    КонецЕсли;
    Возврат _СтрШаблон("Ошибка: '%1': '%2'", ТипЗадачи, ПараметрыЗадачи);
КонецФункции

&НаСервере
Функция ВыполнитьЗадачуНаСервере(ТипЗадачи, ПараметрыЗадачи)
    Если ТипЗадачи = "Management" Тогда
        Возврат ВыполнитьЗадачуУправленияНаСервере(ПараметрыЗадачи);
    ИначеЕсли ТипЗадачи = "Evaluate" Тогда
        Возврат Вычислить(ПараметрыЗадачи.Получить("expression"));
    ИначеЕсли ТипЗадачи = "Execute" Тогда
        Результат = Неопределено;
        Выполнить(ПараметрыЗадачи.Получить("code"));
        Возврат Результат;
    КонецЕсли;
    Возврат "Ошибка: '" + ТипЗадачи + "': '" + ПараметрыЗадачи + "'";
КонецФункции

&НаКлиенте
Функция ВыполнитьЗадачуУправления(ПараметрыЗадачи)
    Команда = ПараметрыЗадачи.Получить("command");
    Если Команда = "ShutDown" Тогда
        ПрекратитьРаботуСистемы();
    ИначеЕсли Команда = "StopPolling" Тогда
        ПрерватьОбработку = Истина;
    КонецЕсли;
КонецФункции

&НаСервере
Функция ВыполнитьЗадачуУправленияНаСервере(ПараметрыЗадачи)
    Команда = ПараметрыЗадачи.Получить("command");
    Если Команда = "ShutDown" Тогда
        ВызватьИсключение "Недоступно на сервере";
    ИначеЕсли Команда = "StopPolling" Тогда
        ПрерватьОбработку = Истина;
    КонецЕсли;
КонецФункции

&НаКлиенте
Функция ОбработатьЗадачу(ТипЗадачи, ПараметрыЗадачи)
    Возврат ВыполнитьЗадачу(ТипЗадачи, ПараметрыЗадачи);
КонецФункции

&НаСервере
Функция ОбработатьЗадачуНаСервере(ТипЗадачи, ПараметрыЗадачи)
    Возврат ВыполнитьЗадачуНаСервере(ТипЗадачи, ПараметрыЗадачи);
КонецФункции

&НаКлиенте
Функция ПодготовитьТелоОтвета(ИдЗадачи, СтатусЗадачи, Результат = Неопределено)
    Данные = Новый Структура("id, status", ИдЗадачи, СтатусЗадачи);
    Если Результат <> Неопределено Тогда
        Данные.Вставить("result", Результат);
    КонецЕсли;
    Возврат СериализоватьВJSON(Данные);
КонецФункции

&НаКлиенте
Процедура ОбработатьЗапросы()
    ПрерватьОбработку = Ложь;
    ПараметрыЗапуска = _СтрРазделить(ПараметрЗапуска, ":");
    Если ПараметрыЗапуска.Количество() < 2 Тогда
        Хост = "127.0.0.1";
        Порт = 3000;
    Иначе
        Хост = ПараметрыЗапуска[0];
        Порт = Число(ПараметрыЗапуска[1]);
    КонецЕсли;
	Соединение = ПолучитьHTTPСоединение(Хост, Порт);
    Пока Не ПрерватьОбработку Цикл
        ОшибкаЗапроса = Ложь;
        Запрос = ПолучитьHTTPЗапрос("/task-requests",,, Новый Структура("status, limit", "Pending", 100));
        Попытка
            Ответ = ОбработатьОтветСервера(Соединение.Получить(Запрос));
        Исключение
            ОшибкаЗапроса = Истина;
        КонецПопытки;
        Если НЕ ОшибкаЗапроса И Ответ.ТелоОтвета.Количество() > 0 Тогда
            Для каждого ОписаниеЗадачи Из Ответ.ТелоОтвета Цикл
                ИдЗадачи = ОписаниеЗадачи.Получить("id");
                ТипЗадачи = ОписаниеЗадачи.Получить("type");
                ПараметрыЗадачи = ОписаниеЗадачи.Получить("parameters");
                ВыполнятьНаСервере = ОписаниеЗадачи.Получить("performOnServer");

                Запрос = ПолучитьHTTPЗапрос("/task-requests",,,, ПодготовитьТелоОтвета(ИдЗадачи, "Processing"));
                Соединение.Записать(Запрос);

                Попытка
                    Если ВыполнятьНаСервере <> Неопределено И ВыполнятьНаСервере Тогда
                        Результат = ОбработатьЗадачуНаСервере(ТипЗадачи, ПараметрыЗадачи);
                    Иначе
                        Результат = ОбработатьЗадачу(ТипЗадачи, ПараметрыЗадачи);
                    КонецЕсли;
                Исключение
                    Результат = Новый Структура("error", ОписаниеОшибки());
                КонецПопытки;

                Запрос = ПолучитьHTTPЗапрос("/task-requests",,,, ПодготовитьТелоОтвета(ИдЗадачи, "Finished", Результат));
                Соединение.Записать(Запрос);
            КонецЦикла;
        Иначе
            Пауза(200);
        КонецЕсли;
    КонецЦикла
КонецПроцедуры

&НаКлиенте
Процедура Команда1(Команда)
	ОбработатьЗапросы();
КонецПроцедуры

&НаКлиенте
Процедура ПриОткрытии(Отказ)
    ОбработатьЗапросы();
КонецПроцедуры

#КонецОбласти



