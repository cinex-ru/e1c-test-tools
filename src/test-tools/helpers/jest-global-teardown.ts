import { INestApplication } from '@nestjs/common';
import { config } from 'dotenv';
import { sleep } from '../lib/utils';
import { shutdownE1c } from '../lib/test-env';

config();
const brokerHost = process.env.BROKER_HOST || '127.0.0.1';
const brokerPort = process.env.BROKER_PORT || '3000';

const shutDownEnv = async () => {
    // eslint-disable-next-line no-underscore-dangle
    const broker = (global as unknown as { __BROKER__: INestApplication }).__BROKER__;

    // if broker not empty then we have to run tear down
    // else we left running e1c with broker
    if (broker) {
        shutdownE1c(brokerHost, brokerPort);

        await sleep(200);

        broker.close();
    }
};

export default shutDownEnv;
