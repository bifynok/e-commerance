const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  process.stdout.write(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: 'DB pool error',
    error: err.message,
  }) + '\n');
});

module.exports = pool;
