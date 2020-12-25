import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { NestFactory } from '@nestjs/core';
import { io } from 'socket.io-client';
import { resolve as pathResolve } from 'path';
import { spawn } from 'child_process';
import { SocketIoAdapter } from '../../server/adapters/socket-io.adapter';
import { AppModule } from '../../server/app.module';
import { TaskProcessingResultDto } from '../../server/task-requests/dto/task-processing-result.dto';
import { UpdateTaskRequestDto } from '../../server/task-requests/dto/update-task-request.dto';

export const checkEnvIsActive = (brokerHost: string, brokerPort: string, timeToWait = 2000): Promise<boolean> => new Promise((resolve) => {
    let marker = 0;
    const successMarker = 42;

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

    const timeoutInterval = 100;
    let counter = timeToWait / timeoutInterval;
    const checkMarker = () => {
        if (marker === successMarker) {
            resolve(true);
        } else {
            counter -= 1;
            if (counter === 0) {
                resolve(false);
            } else {
            // eslint-disable-next-line no-unused-vars
                setTimeout(checkMarker, timeoutInterval);
            }
        }
    };
    setTimeout(checkMarker, timeoutInterval);
});

export const bootstrapBroker = async (brokerHost: string, brokerPort: string): Promise<INestApplication> => {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new SocketIoAdapter(app));
    app.listen(brokerPort, brokerHost);
    return app;
};

export const bootstrapE1c = async (brokerHost: string, brokerPort: string) => {
    const pathToTester = process.env.PATH_TO_TESTER_EXTERNAL_BIN_FILE || pathResolve(__dirname, '../../../1C/tester.epf');

    const args: string[] = [
        'ENTERPRISE',
        `/${process.env.E1C_DB_TYPE}`,
        process.env.E1C_DB_PATH!,
        '/N',
        process.env.E1C_USER!,
        '/P',
        process.env.E1C_PASS!,
        '/Execute',
        pathResolve(pathToTester),
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
};

export const shutdownE1c = async (brokerHost: string, brokerPort: string) => {
    const socket = io(`http://${brokerHost}:${brokerPort}`, { 'transports': ['websocket', 'polling'] });
    socket.on('connect', () => {
        socket.emit('task-requests', {
            'type': 'Management',
            'parameters': {
                'command': 'ShutDown',
            },
        });

        socket.disconnect();
    });
};
