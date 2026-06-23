const path = require('path');

const rootDir = __dirname;
const logDir = path.join(rootDir, 'logs');
const environment = process.env.ENVIRONMENT || process.env.NODE_ENV || 'development';
const viteModeArg = environment === 'staging' ? ' --mode stage' : '';

module.exports = {
  apps: [
    {
      name: 'longrise-fastapi',
      cwd: path.join(rootDir, 'lr_fastapi'),
      script: '.venv/bin/python',
      args: 'main.py',
      interpreter: 'none',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        ENVIRONMENT: process.env.ENVIRONMENT || 'development',
        PORT: 8000,
        API_HOST: '0.0.0.0',
        API_PORT: 8000,
      },
      error_file: path.join(logDir, 'fastapi-error.log'),
      out_file: path.join(logDir, 'fastapi-out.log'),
      log_file: path.join(logDir, 'fastapi.log'),
      time: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      instances: 1,
      autorestart: true
    },
    {
      name: 'longrise-user-frontend',
      cwd: path.join(rootDir, 'lr_user-frontend'),
      script: 'npm',
      args: `run dev -- --host 0.0.0.0 --port 5173${viteModeArg}`,
      interpreter: 'none',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: 5173,
        HOST: '0.0.0.0'
      },
      error_file: path.join(logDir, 'user-frontend-error.log'),
      out_file: path.join(logDir, 'user-frontend-out.log'),
      log_file: path.join(logDir, 'user-frontend.log'),
      time: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      instances: 1,
      autorestart: true
    },
    {
      name: 'longrise-admin-frontend',
      cwd: path.join(rootDir, 'lr_admin-frontend'),
      script: 'npm',
      args: `run dev -- --host 0.0.0.0 --port 5174${viteModeArg}`,
      interpreter: 'none',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: 5174,
        HOST: '0.0.0.0'
      },
      error_file: path.join(logDir, 'admin-frontend-error.log'),
      out_file: path.join(logDir, 'admin-frontend-out.log'),
      log_file: path.join(logDir, 'admin-frontend.log'),
      time: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      instances: 1,
      autorestart: true
    }
  ]
};
