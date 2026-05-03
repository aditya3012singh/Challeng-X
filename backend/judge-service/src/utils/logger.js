import winston from 'winston';
import env from '../config/env.js';

const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: env.JUDGE_SERVICE_NAME },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                    return `${timestamp} [${level}]: ${message} ${metaStr}`;
                })
            )
        }),
        new winston.transports.File({
            filename: 'logs/judge-service-error.log',
            level: 'error',
            format: winston.format.json()
        }),
        new winston.transports.File({
            filename: 'logs/judge-service.log',
            format: winston.format.json()
        })
    ]
});

export default logger;
