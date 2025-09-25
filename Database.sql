CREATE DATABASE IF NOT EXISTS hvac_db;
USE hvac_db;

-- store raw sensor readings (one row per reading)
CREATE TABLE IF NOT EXISTS hvac_readings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  zone VARCHAR(64) DEFAULT 'default',
  temperature FLOAT,
  humidity FLOAT,
  aqi INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- store per-zone target temperatures
CREATE TABLE IF NOT EXISTS targets (
  zone VARCHAR(64) PRIMARY KEY,
  target_temp FLOAT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- simple schedule table
CREATE TABLE IF NOT EXISTS schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  zone VARCHAR(64) DEFAULT 'default',
  cron_time VARCHAR(64), -- e.g. "06:00"
  days VARCHAR(64),      -- e.g. "Mon,Tue,Wed,Thu,Fri" or "Everyday"
  target_temp FLOAT,
  enabled TINYINT DEFAULT 1
);

-- optional: control log
CREATE TABLE IF NOT EXISTS control_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  zone VARCHAR(64) DEFAULT 'default',
  command JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
