require('dotenv').config();
const express = require('express');
const { runMigrations } = require('./db/migrate');
const routes = require('./routes/leaderboard');
const logger = require('./middleware/logger');
const pool = require('./db/pool');

const app = express();
app.use(express.json());
app.use(routes);

let server;

async function start() {
  await runMigrations();

  const PORT = process.env.PORT || 8080;
  server = app.listen(PORT, () => {
    logger.info('Server started', { port: PORT });
  });
}

async function shutdown() {
  logger.info('SIGTERM received. Starting graceful shutdown...');

  server.close(async () => {
    logger.info('HTTP server closed. Closing DB connections...');
    try {
      await pool.end();
      logger.info('Database connections closed. Goodbye!');
    } catch (err) {
      logger.error('Error closing DB pool', { error: err.message });
    }
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

start();

module.exports = app;
