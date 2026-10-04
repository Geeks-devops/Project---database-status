require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Раздаём фронтенд напрямую из Node.js
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.json());

// DB pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
});

// Check DB status
async function checkDb() {
  const start = Date.now();
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    return {
      connected: true,
      latency_ms: Date.now() - start,
      db_version: result.rows[0].version,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    };
  } catch (err) {
    return {
      connected: false,
      latency_ms: Date.now() - start,
      error: err.message,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    };
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime_s: Math.floor(process.uptime()) });
});

app.get('/api/db-status', async (req, res) => {
  const status = await checkDb();
  res.status(status.connected ? 200 : 503).json(status);
});

// SSE — live updates every 5 seconds
app.get('/api/db-status/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = async () => {
    const status = await checkDb();
    res.write(`data: ${JSON.stringify(status)}\n\n`);
  };

  send();
  const interval = setInterval(send, 5000);

  req.on('close', () => clearInterval(interval));
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`DB: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});
