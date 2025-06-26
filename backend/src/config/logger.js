const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log levels with colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Transport configurations
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
  }),
];

// Add file transports only in non-test environment
if (process.env.NODE_ENV !== 'test') {
  // Error logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: path.join(logsDir, 'error-audit.json'),
    })
  );

  // Combined logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: path.join(logsDir, 'combined-audit.json'),
    })
  );

  // HTTP access logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '7d',
      auditFile: path.join(logsDir, 'access-audit.json'),
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format: logFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Handle uncaught exceptions and rejections
if (process.env.NODE_ENV !== 'test') {
  logger.exceptions.handle(
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
    })
  );

  logger.rejections.handle(
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
    })
  );
}

// Helper methods for structured logging
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id || 'anonymous',
    requestId: req.id || 'unknown',
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request Error', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

logger.logError = (error, context = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...context,
  };

  logger.error('Application Error', errorData);
};

logger.logDatabaseQuery = (query, duration, success, error = null) => {
  const queryData = {
    query: query.substring(0, 200), // Limit query length
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    queryData.error = error.message;
    logger.error('Database Query Failed', queryData);
  } else if (duration > 1000) {
    logger.warn('Slow Database Query', queryData);
  } else {
    logger.debug('Database Query', queryData);
  }
};

logger.logUserAction = (userId, action, details = {}) => {
  const actionData = {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details,
  };

  logger.info('User Action', actionData);
};

logger.logSecurityEvent = (event, details = {}) => {
  const securityData = {
    event,
    timestamp: new Date().toISOString(),
    severity: 'high',
    ...details,
  };

  logger.warn('Security Event', securityData);
};

logger.logPerformance = (operation, duration, metadata = {}) => {
  const perfData = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  if (duration > 5000) {
    logger.warn('Performance Issue', perfData);
  } else {
    logger.info('Performance Metric', perfData);
  }
};

// Stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger; 