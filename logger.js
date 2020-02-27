const winston = require("winston");

const createLogger = _fileName => {
  const logConfiguration = {
    transports: [
      new winston.transports.File({
        filename: _fileName
      })
    ],
    format: winston.format.combine(
      winston.format.printf(info => {
        return `${info.message}`;
      })
    )
  };
  return winston.createLogger(logConfiguration);
};

module.exports = createLogger;
