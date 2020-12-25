#!/usr/bin/env node

import { config } from 'dotenv';
import { sleep } from '../lib/utils';
import { shutdownE1c } from '../lib/test-env';

config();
const brokerHost = process.env.BROKER_HOST || '127.0.0.1';
const brokerPort = process.env.BROKER_PORT || '3000';

const main = async () => {
    shutdownE1c(brokerHost, brokerPort);

    await sleep(200);
};

main();
