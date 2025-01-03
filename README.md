# winston-cloudwatch-lab

Small `winston-cloudwatch` POC to demonstrate the use of `winston-cloudwatch` using await in an async function.

The POC uses [promisify](https://www.geeksforgeeks.org/node-js-util-promisify-method/) on [kthxbye](https://github.com/lazywithclass/winston-cloudwatch/blob/master/typescript/winston-cloudwatch.d.ts#L9) function:

[Extract](https://github.com/fa44/winston-cloudwatch-lab/blob/main/hello-world/app.ts#L35):
```
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
    // ...
}
```

## Deploy the sample application

```bash
sam build
sam deploy --guided
```

