const winston = require("winston");

var filename = process.cwd() + '\\logs\\expenseManager.log';

var logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({ filename })
    ]
  });
   
  //
  // If we're in development then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  if (!process.env.NODE_ENV) {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }

  module.exports = {
      logger
  };