'use strict';
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const LOG_DIR   = process.env.LOG_DIR  || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';

const { combine, timestamp, printf, colorize, errors, json } = format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, stack, ...rest }) => {
    const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
    return `${ts} [${level}] ${message}${stack ? '\n' + stack : ''}${extra}`;
  })
);

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: 'hi-conecta-rh' },
  transports: [
    // Console (dev)
    new transports.Console({ format: consoleFormat }),

    // Arquivo: todos os logs
    new DailyRotateFile({
      filename:    path.join(LOG_DIR, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize:     '20m',
      maxFiles:    '14d',
      format:      fileFormat,
    }),

    // Arquivo: somente erros
    new DailyRotateFile({
      filename:    path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level:       'error',
      maxSize:     '20m',
      maxFiles:    '30d',
      format:      fileFormat,
    }),
  ],
});

module.exports = logger;
