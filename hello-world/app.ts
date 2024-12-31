import {
    GetSecretValueCommand,
    SecretsManagerClient,
  } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyResult } from 'aws-lambda';
import { promisify } from 'util';
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const getSecretValue = async (secretName: string) => {
    const client = new SecretsManagerClient();
    const response = await client.send(
        new GetSecretValueCommand({
            SecretId: secretName,
        })
    );
    if (response.SecretString) {
        return response.SecretString;
    }
    throw new Error(`Secret not defined: ${secretName}`);
};

let kthxbyeAsync: (() => any);

const initLogger = async () => {
    if (!kthxbyeAsync) {
        const winstonCloudWatch = new WinstonCloudWatch({
            name: 'using-kthxbye',
            logGroupName: 'testing',
            logStreamName: 'another',
            awsRegion: 'us-east-1',
            awsAccessKeyId: await getSecretValue('AWS_ACCESS_KEY_ID'),
            awsSecretKey: await getSecretValue('AWS_SECRET_KEY'),
        });
        kthxbyeAsync = promisify(winstonCloudWatch.kthxbye).bind(winstonCloudWatch);
        winston.add(winstonCloudWatch);
    
        winston.add(new winston.transports.Console({
            level: 'info'
        }));
    }

    return {
        error: async (...logs: string[]) => {
            winston.error(logs);
            await kthxbyeAsync();
        },
        info: async (...logs: string[]) => {
            winston.info(logs);
            await kthxbyeAsync();
        },
    }
}

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    const logger = await initLogger();

    await logger.error('Error message');
    await logger.info('Info message');

    try {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
