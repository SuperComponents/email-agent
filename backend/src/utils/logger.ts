// backend/src/utils/logger.ts
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default to 'info' if LOG_LEVEL is not set or is invalid
const CURRENT_LOG_LEVEL_NAME = process.env.LOG_LEVEL && LOG_LEVELS.hasOwnProperty(process.env.LOG_LEVEL.toLowerCase())
  ? process.env.LOG_LEVEL.toLowerCase()
  : 'info';

const CURRENT_LOG_LEVEL = LOG_LEVELS[CURRENT_LOG_LEVEL_NAME as keyof typeof LOG_LEVELS];

function formatMessage(level: string, message: string, optionalParams: any[]): string {
  const timestamp = new Date().toISOString();
  const baseMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (optionalParams.length > 0) {
    // Handle objects and arrays in optionalParams
    const formattedParams = optionalParams.map(param => {
      if (typeof param === 'object' && param !== null) {
        try {
          return JSON.stringify(param);
        } catch (e) {
          return '[Unserializable Object]';
        }
      }
      return param;
    }).join(' ');
    return `${baseMessage} ${formattedParams}`;
  }
  return baseMessage;
}

export const log = {
  debug: (message: string, ...optionalParams: any[]) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.debug) {
      console.debug(formatMessage('debug', message, optionalParams));
    }
  },
  info: (message: string, ...optionalParams: any[]) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.info) {
      console.info(formatMessage('info', message, optionalParams));
    }
  },
  warn: (message: string, ...optionalParams: any[]) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message, optionalParams));
    }
  },
  error: (message: string, ...optionalParams: any[]) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.error) {
      console.error(formatMessage('error', message, optionalParams));
    }
  },
};

// Example of how to use:
// import { log } from './logger';
// log.info('This is an info message');
// log.debug('This is a debug message with an object:', { key: 'value' });
// log.error('This is an error');

console.log(`[Logger] Initialized with level: ${CURRENT_LOG_LEVEL_NAME.toUpperCase()}`);
