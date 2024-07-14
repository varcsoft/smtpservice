const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
      new winston.transports.File({ filename: './utils/logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: './utils/logs/main.log' })
    ]
});

module.exports = logger;