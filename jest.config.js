/* eslint-disable no-useless-escape */
module.exports = {
    'preset': 'ts-jest',
    'testEnvironment': 'node',
    'testPathIgnorePatterns': [
        '\./out/',
        '\./build/',
        '\./dist/',
    ],
    'cacheDirectory': './tmp',
    'globalSetup': './src/test-tools/helpers/jest-global-setup.ts',
    'globalTeardown': './src/test-tools/helpers/jest-global-teardown.ts',
};
