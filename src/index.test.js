const request = require('supertest');

jest.mock('./db/pool', () => ({
  query: jest.fn(),
  end:   jest.fn().mockResolvedValue(true),
}));

jest.mock('./db/migrate', () => ({
  runMigrations: jest.fn().mockResolvedValue(true),
}));

const pool = require('./db/pool');
const app  = require('./index');

describe('GET /health', () => {
  it('returns 200 if DB available', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns 503 if DB is not available', async () => {
    pool.query.mockRejectedValueOnce(new Error('Connection refused'));
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('error');
  });
});

describe('GET /leaderboard', () => {
  it('returns leaderboard lsit', async () => {
    const mockRows = [
      { id: 1, player: 'nEHEK2004',    score: 2004, created_at: new Date().toISOString() },
      { id: 2, player: 'Bobby',        score: 1337, created_at: new Date().toISOString() },
      { id: 3, player: 'TheOmniGod13', score: 1488, created_at: new Date().toISOString() },
    ];
    pool.query.mockResolvedValueOnce({ rows: mockRows });
    const res = await request(app).get('/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].player).toBe('nEHEK2004');
  });
});

describe('POST /score', () => {
  it('posts new entry and returns 201', async () => {
    const newEntry = { id: 4, player: 'zxc_Cargobob', score: 1939, created_at: new Date().toISOString() };
    pool.query.mockResolvedValueOnce({ rows: [newEntry] });
    const res = await request(app)
      .post('/score')
      .send({ player: 'zxc_Cargobob', score: 1939 });
    expect(res.status).toBe(201);
    expect(res.body.player).toBe('zxc_Cargobob');
  });

  it('returns 400 if invalid entry', async () => {
    const res = await request(app)
      .post('/score')
      .send({ score: 100 });
    expect(res.status).toBe(400);
  });

  it('returns 400 if score invalid', async () => {
    const res = await request(app)
      .post('/score')
      .send({ player: 'Hacker', score: -1 });
    expect(res.status).toBe(400);
  });
});
