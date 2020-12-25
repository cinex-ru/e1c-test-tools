import { config } from 'dotenv';
import { generateMockedExternalBinFile } from '../lib/mock-utils/mock-generation';
import { checkEnvIsActive, bootstrapBroker, bootstrapE1c } from '../lib/test-env';

config();
const brokerHost = process.env.BROKER_HOST || '127.0.0.1';
const brokerPort = process.env.BROKER_PORT || '3000';

const setupTestEnv = async () => {
    if (!(await checkEnvIsActive(brokerHost, brokerPort))) {
        const app = await bootstrapBroker(brokerHost, brokerPort);

        await bootstrapE1c(brokerHost, brokerPort);
        const e1cStarted = await checkEnvIsActive(brokerHost, brokerPort, 300000);
        if (!e1cStarted) {
            throw new Error('E1c start timeout (300s)');
        }

        // eslint-disable-next-line no-underscore-dangle
        (global as unknown as { __BROKER__: any }).__BROKER__ = app;
    }
    if (process.env.PATH_TO_EXTERNAL_BIN_FILE) {
        await generateMockedExternalBinFile(process.env.PATH_TO_EXTERNAL_BIN_FILE);
    }
};

export default setupTestEnv;
