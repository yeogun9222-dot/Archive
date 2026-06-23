# Longrise Staging Deployment Guide

This guide provides step-by-step instructions for deploying the Longrise application to AWS EC2 staging environment with automated CI/CD.

## Architecture Overview

- **Single EC2 Instance**: Hosts all services
- **FastAPI Backend**: Port 8000
- **User Frontend**: Port 5173 (Vite)
- **Admin Frontend**: Port 5174 (Vite)
- **Database**: External AWS RDS PostgreSQL
- **Process Manager**: PM2 with ecosystem.config.cjs

## Prerequisites

1. AWS CLI configured with Longrise account
2. GitHub CLI authenticated
3. EC2 instance created with Ubuntu
4. SSH key pair for EC2 access

## Deployment Steps

### 1. Initial EC2 Setup

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.11 and pip
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install UV (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc

# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup
pm2 startup
# Follow the instructions provided by PM2

# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git longrise
cd longrise
```

### 2. Environment Configuration

```bash
# Setup FastAPI staging environment
cd lr_fastapi
cp .env.staging.template .env.local
# Edit .env.local with your staging EC2 public IP and proper settings
uv venv
source .venv/bin/activate
uv sync
cd ..

# Setup Frontend environments
cd lr_user-frontend
npm install
cd ../lr_admin-frontend
npm install
cd ..
```

### 3. Local Infrastructure Setup

From your local machine, run these scripts:

```bash
# Setup AWS Security Groups
./setup-aws-security-groups.sh

# Setup GitHub Secrets
./setup-github-secrets.sh
```

### 4. Initial Deployment

```bash
# On EC2: Start services with PM2
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

### 5. Verify Staging Deployment

```bash
# Check API health
curl http://YOUR_STAGING_EC2_IP:8000/health

# Check frontends in browser
# User Frontend: http://YOUR_STAGING_EC2_IP:5173
# Admin Frontend: http://YOUR_STAGING_EC2_IP:5174
```

## Automated Staging CI/CD

Once setup is complete, the GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:

1. Deploy on every push to `stage` branch
2. Update dependencies
3. Restart services with PM2
4. Perform health checks

## Monitoring

```bash
# View PM2 logs
pm2 logs

# View specific service logs
pm2 logs longrise-api
pm2 logs longrise-user-frontend
pm2 logs longrise-admin-frontend

# Monitor resources
pm2 monit
```

## Troubleshooting

### Service Won't Start
```bash
pm2 restart all
pm2 logs
```

### Port Already in Use
```bash
sudo netstat -tlnp | grep :PORT
pm2 kill
pm2 start ecosystem.config.cjs
```

### CORS Issues
- Update `BACKEND_CORS_ORIGINS` in `lr_fastapi/.env.local`
- Include your staging EC2 public IP for all ports

### Database Connection
- Verify RDS security group allows staging EC2 access
- Check DATABASE_URL in .env.local

## Scripts Reference

- `setup-aws-security-groups.sh`: Configure staging EC2 security groups
- `setup-github-secrets.sh`: Setup GitHub repository secrets for staging
- `ecosystem.config.cjs`: PM2 process configuration for staging
- `.github/workflows/deploy.yml`: GitHub Actions staging CI/CD workflow

## Security Notes

- Staging EC2 security groups only allow necessary ports
- SSH access restricted to your IP (recommended)
- Environment variables properly configured for staging
- Staging secrets different from development and production

## Updates and Maintenance

1. Push to `stage` branch triggers auto-deployment
2. Manual staging deployment: `git pull origin stage && pm2 reload all`
3. Database migrations: Run from `lr_fastapi` directory
4. Monitor staging logs regularly: `pm2 logs`
