import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { config } from 'dotenv';
import { sleep } from './utils';

config();
const brokerHost = process.env.BROKER_HOST || '127.0.0.1';
const brokerPort = process.env.BROKER_PORT || 3000;

const main = async () => {
    // eslint-disable-next-line no-underscore-dangle
    const broker = (global as unknown as { __BROKER__: INestApplication }).__BROKER__;

    // if broker not empty then we have to run tear down
    // else we left running e1c with broker
    if (broker) {
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

        await sleep(200);

        broker.close();
    }
};

export default main;
