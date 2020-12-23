import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { io } from 'socket.io-client';
import { resolve } from 'path';
import { spawn } from 'child_process';
import { SocketIoAdapter } from '../server/adapters/socket-io.adapter';
import { AppModule } from '../server/app.module';
import { UpdateTaskRequestDto } from '../server/task-requests/dto/update-task-request.dto';
import { sleep } from './utils';
import { TaskProcessingResultDto } from '../server/task-requests/dto/task-processing-result.dto';

config();
const brokerHost = process.env.BROKER_HOST || '127.0.0.1';
const brokerPort = process.env.BROKER_PORT || 3000;

async function bootstrapBroker(): Promise<INestApplication> {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new SocketIoAdapter(app));
    app.listen(brokerPort, brokerHost);
    return app;
}

const main = async () => {
    let marker = 0;

    const socket = io(`http://${brokerHost}:${brokerPort}`, { 'transports': ['websocket', 'polling'] });
    socket.on('connect', () => {
        socket.emit('task-requests', {
            'type': 'Evaluate',
            'parameters': {
                'expression': '6 * 7',
            },
        });

        socket.on('task-statuses', (data: UpdateTaskRequestDto) => {
            if (data.status === 'Finished') {
                socket.emit('task-results', { 'id': data.id });
            }
        });

        socket.on('task-results', (data: TaskProcessingResultDto) => {
            marker = parseInt(data.result, 10);
            socket.disconnect();
        });
    });

    let counter = 20;
    while (marker !== 42 && counter > 0) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(50);
        counter -= 1;
    }

    if (marker !== 42) {
        const app = await bootstrapBroker();

        const args: string[] = [
            'ENTERPRISE',
            `/${process.env.E1C_DB_TYPE}`,
            process.env.E1C_DB_PATH!,
            '/N',
            process.env.E1C_USER!,
            '/P',
            process.env.E1C_PASS!,
            '/Execute',
            resolve(process.env.PATH_TO_EXTERNAL_BIN_FILE!),
            '/C',
            `${brokerHost}:${brokerPort}`,
            '/DisableStartupDialogs',
            '/DisableStartupMessages',
            '/DisableSplash',
        ];

        const child = spawn(process.env.PATH_TO_E1C_EXECUTABLE!, args, {
            'detached': true,
            'stdio': ['ignore', 1, 2],
        });
        child.unref();

        while (marker !== 42) {
            // eslint-disable-next-line no-await-in-loop
            await sleep(50);
        }

        // eslint-disable-next-line no-underscore-dangle
        (global as unknown as { __BROKER__: any }).__BROKER__ = app;
    }
};

export default main;
