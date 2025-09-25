require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const mysql = require('mysql2/promise');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// CORS middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { 
  cors: corsOptions
});

const PORT = process.env.PORT || 3000;
const MQTT_URL = process.env.MQTT_URL || 'mqtt://127.0.0.1:1883';

// -------- MySQL pool --------
let pool;
async function initDB() {
  pool = await mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'hvac_db',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('MySQL pool created');
}
initDB().catch(err => {
  console.error('Failed to create DB pool:', err);
  process.exit(1);
});

// -------- MQTT client --------
const mqttOptions = {};
if (process.env.MQTT_USER) mqttOptions.username = process.env.MQTT_USER;
if (process.env.MQTT_PASS) mqttOptions.password = process.env.MQTT_PASS;

const mqttClient = mqtt.connect(MQTT_URL, mqttOptions);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker:', MQTT_URL);
  // subscribe to topics where sensor nodes publish readings
  mqttClient.subscribe('sensor/+/reading', { qos: 0 });   // e.g., sensor/livingroom/reading
  mqttClient.subscribe('sensor/aqi', { qos: 0 });         // legacy single-topic
  mqttClient.subscribe('hvac/data', { qos: 0 });          // combined payloads
});

// Handle incoming MQTT messages
mqttClient.on('message', async (topic, payload) => {
  try {
    const msg = payload.toString();
    console.log('MQTT msg', topic, msg);
    // Try to parse as JSON; if not JSON, ignore or interpret simple
    let data;
    try { data = JSON.parse(msg); } catch (e) { data = null; }

    // Topic patterns:
    // 1) sensor/{zone}/reading -> payload: { temperature, humidity, aqi }
    // 2) hvac/data -> payload: { zone, temperature, humidity, aqi }
    // 3) sensor/aqi -> payload: 123  (integer)
    if (topic.startsWith('sensor/') && topic.endsWith('/reading') && data) {
      const zone = topic.split('/')[1] || 'default';
      await storeReading(zone, data.temperature, data.humidity, data.aqi);
    } else if (topic === 'hvac/data' && data) {
      const zone = data.zone || 'default';
      await storeReading(zone, data.temperature, data.humidity, data.aqi);
    } else if (topic === 'sensor/aqi') {
      // store simple aqi value into default zone reading
      const aqi = parseInt(msg);
      await storeReading('default', null, null, aqi);
    } else {
      // Unknown topic - ignore for now
    }
  } catch (err) {
    console.error('Error handling MQTT message:', err);
  }
});

// helper to insert reading & emit to sockets
async function storeReading(zone = 'default', temperature = null, humidity = null, aqi = null) {
  try {
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO hvac_readings (zone, temperature, humidity, aqi) VALUES (?, ?, ?, ?)',
      [zone, temperature, humidity, aqi]
    );
    conn.release();

    // Emit realtime to connected frontends
    const payload = { zone, temperature, humidity, aqi, ts: new Date() };
    io.emit('reading', payload);
    console.log('Stored reading & emitted', payload);
  } catch (err) {
    console.error('DB insert error', err);
  }
}

// -------- Express API Endpoints --------

// health
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// get latest readings (optionally per zone)
app.get('/api/hvac/status', async (req, res) => {
  const zone = req.query.zone || 'default';
  try {
    const [rows] = await pool.query(
      'SELECT * FROM hvac_readings WHERE zone=? ORDER BY created_at DESC LIMIT 1',
      [zone]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db-error' });
  }
});

// HTTP endpoint for devices to POST readings (alternative to MQTT)
app.post('/api/hvac/readings', async (req, res) => {
  const { zone = 'default', temperature = null, humidity = null, aqi = null } = req.body;
  try {
    await storeReading(zone, temperature, humidity, aqi);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db-error' });
  }
});

// get/set target temperature for a zone
app.get('/api/hvac/target', async (req, res) => {
  const zone = req.query.zone || 'default';
  try {
    const [rows] = await pool.query('SELECT * FROM targets WHERE zone = ?', [zone]);
    if (rows.length) return res.json(rows[0]);
    return res.json(null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db-error' });
  }
});

app.post('/api/hvac/target', async (req, res) => {
  const { zone = 'default', target_temp } = req.body;
  if (typeof target_temp === 'undefined') return res.status(400).json({ error: 'missing target_temp' });
  try {
    await pool.query(
      'INSERT INTO targets (zone, target_temp) VALUES (?, ?) ON DUPLICATE KEY UPDATE target_temp = VALUES(target_temp), updated_at = CURRENT_TIMESTAMP',
      [zone, target_temp]
    );

    // publish command to device(s) so they update their internal target immediately
    const cmd = { cmd: 'set_target', target_temp: Number(target_temp), zone };
    mqttClient.publish(`hvac/command/${zone}`, JSON.stringify(cmd));

    // log command
    await pool.query('INSERT INTO control_logs (zone, command) VALUES (?, ?)', [zone, JSON.stringify(cmd)]);

    io.emit('target_update', { zone, target_temp }); // notify frontends
    res.json({ ok: true, cmd });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db-error' });
  }
});

// send arbitrary control command (force mode, fan speed etc.)
app.post('/api/hvac/control', async (req, res) => {
  const { zone = 'default', command } = req.body;
  if (!command) return res.status(400).json({ error: 'missing command' });
  try {
    const topic = `hvac/command/${zone}`;
    mqttClient.publish(topic, JSON.stringify(command));
    await pool.query('INSERT INTO control_logs (zone, command) VALUES (?, ?)', [zone, JSON.stringify(command)]);
    io.emit('control_log', { zone, command, ts: new Date() });
    res.json({ ok: true, topic, command });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'publish-failed' });
  }
});

// schedules CRUD (simple)
app.get('/api/schedules', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM schedules ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db-error' });
  }
});

app.post('/api/schedules', async (req, res) => {
  const { zone = 'default', cron_time, days = 'Everyday', target_temp, enabled = 1 } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO schedules (zone, cron_time, days, target_temp, enabled) VALUES (?, ?, ?, ?, ?)',
      [zone, cron_time, days, target_temp, enabled]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db-error' });
  }
});

// -------- Socket.IO connection log --------
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// -------- Start server --------
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
