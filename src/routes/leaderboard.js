const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ status: 'ok', db: 'connected' });
  } catch {
    return res.status(503).json({ status: 'error', db: 'unavailable' });
  }
});

router.get('/leaderboard', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  try {
    const { rows } = await pool.query(
      `SELECT id, player, score, created_at
       FROM leaderboard
       ORDER BY score DESC
       LIMIT $1`,
      [limit]
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

router.post('/score', async (req, res) => {
  const { player, score } = req.body;

  if (!player || typeof score !== 'number') {
    return res.status(400).json({ error: 'player (string) and score (number) are required' });
  }
  if (score < 0) {
    return res.status(400).json({ error: 'score must be >= 0' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO leaderboard (player, score)
       VALUES ($1, $2)
       RETURNING id, player, score, created_at`,
      [player, score]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
