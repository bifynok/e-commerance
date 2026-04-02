const fs = require('fs');
const path = require('path');
const pool = require('./pool');
const logger = require('../middleware/logger');

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM _migrations WHERE filename = $1', [file]
      );

      if (rows.length === 0) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
          await client.query('COMMIT');
          logger.info(`Migration applied: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      } else {
        logger.info(`Already applied, skipping: ${file}`);
      }
    }

    logger.info('Migrations complete!');
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };
