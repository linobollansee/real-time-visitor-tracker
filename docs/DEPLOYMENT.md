# Deployment Guide

Complete guide for deploying the Real-Time Visitor Tracker to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Security Hardening](#security-hardening)
- [Monitoring & Logging](#monitoring--logging)
- [Scaling Considerations](#scaling-considerations)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Required

- [ ] Domain name purchased and configured
- [ ] SSL/TLS certificate (Let's Encrypt or purchased)
- [ ] Production database/Redis instance
- [ ] Environment variables configured
- [ ] Error logging service (Sentry, LogRocket, etc.)
- [ ] Monitoring service (DataDog, New Relic, etc.)

### Recommended

- [ ] CI/CD pipeline configured
- [ ] Automated backups enabled
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated
- [ ] Disaster recovery plan

### Code Modifications for Production

#### 1. Enable HTTPS-only cookies

**File: `backend/server.js`**

```javascript
res.cookie("visitorId", sessionId, {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true, // ADD THIS for HTTPS
  sameSite: "strict", // Stronger CSRF protection
});
```

#### 2. Update CORS configuration

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://yourdomain.com",
    credentials: true,
  })
);
```

#### 3. Add rate limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});

app.use("/events", limiter);
```

#### 4. Add helmet for security headers

```bash
npm install helmet
```

```javascript
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://yourdomain.com"],
      },
    },
  })
);
```

---

## Environment Configuration

### Backend Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Database (if using persistence)
REDIS_URL=redis://user:password@hostname:port/database
REDIS_TLS=true

# Session
SESSION_SECRET=your-super-secret-key-change-this

# Logging
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn

# Monitoring
NEW_RELIC_LICENSE_KEY=your-key
NEW_RELIC_APP_NAME=visitor-tracker-backend
```

### Frontend Environment Variables

Create `.env.production` file in `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_TELEMETRY_DISABLED=1
```

### Load Environment Variables

**Backend:**

```bash
npm install dotenv
```

```javascript
// At the top of server.js
require("dotenv").config();
```

---

## Backend Deployment

### Option 1: Heroku

#### Step 1: Install Heroku CLI

```bash
npm install -g heroku
heroku login
```

#### Step 2: Create Heroku App

```bash
cd backend
heroku create your-app-name
```

#### Step 3: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://yourdomain.com
```

#### Step 4: Create Procfile

**File: `backend/Procfile`**

```
web: node server.js
```

#### Step 5: Deploy

```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

#### Step 6: Open App

```bash
heroku open
heroku logs --tail
```

---

### Option 2: Railway

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Initialize Project

```bash
cd backend
railway init
```

#### Step 3: Configure

```bash
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://yourdomain.com
```

#### Step 4: Deploy

```bash
railway up
```

---

### Option 3: Render

#### Step 1: Create `render.yaml`

**File: `backend/render.yaml`**

```yaml
services:
  - type: web
    name: visitor-tracker-backend
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: FRONTEND_URL
        value: https://yourdomain.com
```

#### Step 2: Connect to GitHub and Deploy

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Render will automatically deploy

---

### Option 4: DigitalOcean Droplet

#### Step 1: Create Droplet

```bash
# Create Ubuntu 22.04 droplet via DigitalOcean dashboard
# SSH into droplet
ssh root@your-droplet-ip
```

#### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

#### Step 3: Clone and Setup Project

```bash
cd /var/www
git clone https://github.com/yourusername/real-time-visitor-tracker.git
cd real-time-visitor-tracker/backend
npm install

# Create .env file
nano .env
# Add your environment variables
```

#### Step 4: Start with PM2

```bash
pm2 start server.js --name visitor-tracker-backend
pm2 startup
pm2 save
```

#### Step 5: Configure Nginx

**File: `/etc/nginx/sites-available/visitor-tracker`**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # SSE specific
        proxy_set_header X-Accel-Buffering no;
        proxy_buffering off;
        proxy_cache off;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/visitor-tracker /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### Step 6: Enable SSL

```bash
certbot --nginx -d api.yourdomain.com
```

---

### Option 5: AWS EC2

#### Step 1: Launch EC2 Instance

- AMI: Ubuntu Server 22.04 LTS
- Instance Type: t2.micro (free tier)
- Security Group: Allow ports 22, 80, 443

#### Step 2: Connect and Setup

```bash
ssh -i your-key.pem ubuntu@ec2-ip-address

# Follow same steps as DigitalOcean (Step 2-6 above)
```

#### Step 3: Use Elastic IP

```bash
# Allocate Elastic IP in AWS Console
# Associate with your EC2 instance
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
cd frontend
vercel
```

#### Step 3: Set Environment Variables

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.yourdomain.com
```

#### Step 4: Deploy to Production

```bash
vercel --prod
```

#### Step 5: Configure Custom Domain

```bash
vercel domains add yourdomain.com
```

---

### Option 2: Netlify

#### Step 1: Build Configuration

**File: `frontend/netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### Step 2: Deploy via CLI

```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

Or connect GitHub repository via Netlify dashboard.

---

### Option 3: Static Export + AWS S3

#### Step 1: Configure Next.js for Static Export

**File: `frontend/next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

#### Step 2: Build

```bash
cd frontend
npm run build
```

#### Step 3: Deploy to S3

```bash
aws s3 sync out/ s3://your-bucket-name --delete
```

#### Step 4: Configure CloudFront

- Create CloudFront distribution
- Origin: Your S3 bucket
- Enable HTTPS
- Set custom domain

---

## Database Setup

### Option 1: Redis Cloud

For persistent visitor tracking.

#### Step 1: Create Redis Instance

1. Go to [redis.com](https://redis.com)
2. Create free account
3. Create new database

#### Step 2: Install Redis Client

```bash
cd backend
npm install redis
```

#### Step 3: Modify Backend

**File: `backend/server.js`**

```javascript
const redis = require("redis");

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redisClient.connect().catch(console.error);

// Use Redis for storage instead of Map
async function incrementVisitors(sessionId) {
  await redisClient.sAdd("active_sessions", sessionId);
  const count = await redisClient.sCard("active_sessions");
  return count;
}
```

---

### Option 2: PostgreSQL (For Analytics)

Store historical data.

#### Step 1: Create Database

```sql
CREATE TABLE visitor_events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_session_id ON visitor_events(session_id);
CREATE INDEX idx_timestamp ON visitor_events(timestamp);
```

#### Step 2: Install pg

```bash
npm install pg
```

#### Step 3: Log Events

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function logEvent(sessionId, eventType, metadata = {}) {
  await pool.query(
    "INSERT INTO visitor_events (session_id, event_type, metadata) VALUES ($1, $2, $3)",
    [sessionId, eventType, JSON.stringify(metadata)]
  );
}
```

---

## Security Hardening

### 1. Enable HTTPS Everywhere

**Backend (Express):**

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (
    req.header("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV === "production"
  ) {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});
```

### 2. Secure Headers

```bash
npm install helmet
```

```javascript
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.yourdomain.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

### 3. Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/events", apiLimiter);
```

### 4. Input Validation

```bash
npm install express-validator
```

```javascript
const { query, validationResult } = require("express-validator");

app.get(
  "/health",
  query("format").optional().isIn(["json", "xml"]),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Handle request
  }
);
```

### 5. CORS Configuration

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = ["https://yourdomain.com", "https://www.yourdomain.com"];
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
```

---

## Monitoring & Logging

### 1. Winston Logger

```bash
npm install winston
```

**File: `backend/logger.js`**

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
```

**Usage:**

```javascript
const logger = require("./logger");

logger.info("New connection", { sessionId, totalConnections });
logger.error("Connection error", { error: err.message });
```

### 2. Sentry Integration

```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### 3. Health Check Endpoint

```javascript
app.get("/health", (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: {
      total: totalConnections,
      unique: activeConnections.size,
    },
  };

  res.json(health);
});
```

---

## Scaling Considerations

### Horizontal Scaling with Redis

```javascript
const redis = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const pubClient = redis.createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

// Use Redis for broadcasting across multiple servers
pubClient.publish("visitor-updates", JSON.stringify(data));
subClient.subscribe("visitor-updates", (message) => {
  broadcastToLocalClients(JSON.parse(message));
});
```

### Load Balancing

**Nginx Configuration:**

```nginx
upstream backend {
    least_conn;
    server backend1.yourdomain.com:3001;
    server backend2.yourdomain.com:3001;
    server backend3.yourdomain.com:3001;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Sticky sessions for SSE
        ip_hash;
    }
}
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
curl https://api.yourdomain.com/health
```

### 2. Monitor Logs

```bash
pm2 logs visitor-tracker-backend
# or
heroku logs --tail
```

### 3. Set Up Alerts

- Configure uptime monitoring (UptimeRobot, Pingdom)
- Set up error alerts (Sentry, PagerDuty)
- Monitor resource usage

### 4. Backup Strategy

- Automate database backups
- Version control for code
- Document recovery procedures

---

## Rollback Procedure

If deployment fails:

```bash
# Heroku
heroku rollback

# PM2
pm2 restart visitor-tracker-backend
pm2 logs

# Vercel
vercel rollback
```

---

## Further Reading

- [Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx SSE Configuration](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
