import {
    extname, join, basename, parse,
} from 'path';
import RepoDispatcher from 'e1c-repo-tools/dist/E1cDispatcher';
import { tmpdir } from 'os';
import glob, { IOptions } from 'glob';
import {
    mkdtemp, ensureDir, outputFile, readFile, move,
} from 'fs-extra';
import { promises as fs } from 'fs';

const NameToReplace = 'TesterSpecialLongNameForSelfTesting_afd1dd579eec439eb41e09c4b84f3222';

// TODO: move to utils
const promiseGlob = (pattern: string, options: IOptions): Promise<string[]> => new Promise((resolve, reject) => {
    glob(pattern, options, (err, matches) => {
        if (err) {
            reject(err);
        } else {
            resolve(matches);
        }
    });
});

// FIXME: till Great refactoring
export const getRootSrcFiles = async (dispatcher: RepoDispatcher): Promise<string[]> => Promise.all(
    (await fs.readdir(dispatcher.pathToSrcDir, { 'encoding': 'utf8', 'withFileTypes': true }))
        .filter((file) => file.isDirectory && !file.name.match(/.bak\d*$/gmi))
        .map(async (dir) => join(dispatcher.pathToSrcDir, dir.name,
            (await fs.readdir(join(dispatcher.pathToSrcDir, dir.name), { 'encoding': 'utf8', 'withFileTypes': true }))
                .filter((file) => file.isFile && file.name.match(/.xml$/gmi))[0].name)),
);

const getTextForInsert = (pathToFile: string): string => {
    let prefix = '';
    if (!basename(pathToFile).startsWith('ObjectModule')) {
        prefix = '&НаКлиенте';
    }

    return `
${prefix}
Функция ЭкспортируемыйМетод(ИмяМетода, ПараметрыМетода) Экспорт
    ИнициализацияПараметров = "";
    ИменаПараметров = "";
    Для Инд = 0 По ПараметрыМетода.Количество() - 1 Цикл
        ИмяПараметра = "__Парам" + Инд;
        ИменаПараметров = ИменаПараметров + ИмяПараметра + ", ";
        ИнициализацияПараметров = ИнициализацияПараметров + ИмяПараметра + " = ПараметрыМетода[" + Инд + "];" + Символы.ПС;
    КонецЦикла;
    Если СтрДлина(ИменаПараметров) > 0 Тогда
        ИменаПараметров = Лев(ИменаПараметров, СтрДлина(ИменаПараметров) - 2);
    КонецЕсли;

    Результат = Неопределено;
    Выполнить(ИнициализацияПараметров + "Результат = " + ИмяМетода + "(" + ИменаПараметров + ");");

    Возврат Результат;
КонецФункции
        `;
};

export const generateMockedExternalBinFile = async (pathToExternalBinFile: string) => {
    const workDir = await mkdtemp(join(tmpdir(), 'mock_'));
    const distDir = join(workDir, 'dist');
    await ensureDir(distDir);
    const srcDir = join(workDir, 'src');
    await ensureDir(srcDir);
    const logsDir = join(workDir, 'logs');
    await ensureDir(logsDir);

    const repoConfig = {
        'pathToExecutable': process.env.PATH_TO_E1C_EXECUTABLE!,
        'pathToDistDir': distDir,
        'pathToSrcDir': srcDir,
        'pathToLogsDir': logsDir,
        'filesExtensions': [extname(pathToExternalBinFile)],
    };
    const repoDispatcher = new RepoDispatcher(repoConfig);

    const result = await repoDispatcher.DumpExternalBinFile(pathToExternalBinFile);

    await Promise.all(
        (await promiseGlob('**/*.bsl', { 'cwd': result.pathToSrcFiles }))
            .map((filename) => join(result.pathToSrcFiles, filename))
            .map(async (filename) => ([filename, (await readFile(filename, 'utf8')).concat(getTextForInsert(filename))] as [string, string]))
            .map(async (fileData: Promise<[string, string]>) => (outputFile(...(await fileData)))),
    );

    await Promise.all(
        (await promiseGlob('**/*.xml', { 'cwd': result.pathToSrcFiles }))
            .map((filename) => join(result.pathToSrcFiles, filename))
            .map(async (filename) => ([filename, (await readFile(filename, 'utf8')).split(NameToReplace).join('Tester')] as [string, string]))
            .map(async (fileData: Promise<[string, string]>) => (outputFile(...(await fileData)))),
    );

    const pathToMockedExternalBinFiles = process.env.PATH_TO_MOCKED_EXTERNAL_BIN_FILES;
    const rootSrcFiles = await getRootSrcFiles(repoDispatcher);
    for (let i = 0; i < rootSrcFiles.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const dumpedFileInfo = await repoDispatcher.BuildExternalBinFile(rootSrcFiles[i]);

        if (pathToMockedExternalBinFiles) {
            const parsedPath = parse(dumpedFileInfo.pathToBinFile);
            // eslint-disable-next-line no-await-in-loop
            await move(
                dumpedFileInfo.pathToBinFile,
                join(pathToMockedExternalBinFiles, `${parsedPath.base}`),
                { 'overwrite': true },
            );
        }
    }
};
