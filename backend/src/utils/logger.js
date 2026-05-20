// src/utils/logger.js
import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: isDev ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname'
        }
    } : undefined
});

export default logger;
