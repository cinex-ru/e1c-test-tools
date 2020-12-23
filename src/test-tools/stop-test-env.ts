import { io } from 'socket.io-client';
import { config } from 'dotenv';
import { sleep } from './utils';

config();
const brokerHost = process.env.BROKER_HOST || '127.0.0.1';
const brokerPort = process.env.BROKER_PORT || 3000;

const main = async () => {
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
};

main();
