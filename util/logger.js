import winston, { format } from 'winston';
import CloudWatchTransport from 'winston-aws-cloudwatch';

const env = process.env.NODE_ENV || 'development';

const logger = winston.createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.align(),
    format.colorize(),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
});

if (process.env.AWS_CLOUDWATCH_LOG_GROUP) {
  logger.add(
    new CloudWatchTransport({
      logGroupName: process.env.AWS_CLOUDWATCH_LOG_GROUP,
      logStreamName: process.env.AWS_CLOUDWATCH_LOG_STREAM,
      createLogGroup: false,
      createLogStream: false,
      batchSize: 20,
      awsConfig: {
        accessKeyId: process.env.AWS_ACCESS_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_REGION,
      },
      formatLog: (item) => `${item.level}: ${item.message} ${JSON.stringify(item.meta)}`,
    })
  );
}

logger.add(new winston.transports.Console());

export default logger;
