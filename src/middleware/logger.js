const logger = {
  info: (message, extra = {}) => {
    process.stdout.write(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...extra,
    }) + '\n');
  },
  error: (message, extra = {}) => {
    process.stdout.write(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      ...extra,
    }) + '\n');
  },
  warn: (message, extra = {}) => {
    process.stdout.write(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...extra,
    }) + '\n');
  },
};

module.exports = logger;
