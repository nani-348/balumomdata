# 🚀 Deployment Guide - Balu Associates Portal

Complete step-by-step guide to deploy your portal to production.

---

## 📋 Prerequisites

- GitHub account (code already pushed)
- Supabase account (database already set up)
- Hosting platform (Vercel, Netlify, or your own server)
- Node.js v16+ installed

---

## 🔐 Step 1: Secure Your Credentials

### 1.1 Backend Environment Variables
Never commit `.env` file! It's already in `.gitignore`.

Create `backend/.env` with:
```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://your-domain.com
```

### 1.2 Frontend Configuration
The frontend now uses `CONFIG` object. No hardcoded keys!

---

## 🌐 Step 2: Choose Hosting Platform

### Option A: Vercel (Recommended - Easiest)

**Frontend:**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Configure:
   - Framework: Other
   - Root Directory: ./
5. Deploy!

**Backend:**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import same repo
4. Configure:
   - Framework: Node.js
   - Root Directory: ./backend
5. Add environment variables:
   - Go to Settings → Environment Variables
   - Add all variables from `.env`
6. Deploy!

### Option B: Netlify

**Frontend:**
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub
4. Configure:
   - Build command: (leave empty)
   - Publish directory: ./
5. Deploy!

**Backend:**
Use Vercel or Railway for backend (Netlify doesn't support Node.js servers)

### Option C: Your Own Server (VPS)

**Requirements:**
- Ubuntu/Linux server
- SSH access
- Node.js installed

**Steps:**
```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone repo
git clone https://github.com/nani-348/balumomdata.git
cd balumomdata

# 3. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
nano .env

# 4. Start backend with PM2 (keeps it running)
npm install -g pm2
pm2 start server.js --name "balu-backend"
pm2 startup
pm2 save

# 5. Setup frontend (use Nginx)
cd ..
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Add to Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/balumomdata;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Step 3: Update CORS Settings

Update `backend/server.js` for production:

```javascript
const allowedOrigins = [
    'https://your-domain.com',
    'https://www.your-domain.com',
    'https://portal.your-domain.com'
];
```

---

## 🌍 Step 4: Update Frontend API URL

In `portal-api.js`, update:
```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

Or use relative path:
```javascript
const API_BASE_URL = '/api';
```

---

## 📊 Step 5: Supabase Production Setup

### 5.1 Create Production Project
1. Go to Supabase
2. Create new project (separate from development)
3. Run SQL from `SUPABASE_SETUP.md`
4. Create storage bucket `company-files` (public)
5. Disable RLS (or configure proper policies)

### 5.2 Update Credentials
Update `backend/.env` with production Supabase keys

---

## 🧪 Step 6: Test Deployment

### Test Backend
```bash
curl https://your-api-domain.com/health
```

Should return:
```json
{"status":"OK","message":"Server is running"}
```

### Test Login
```bash
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Test Frontend
Open: `https://your-domain.com/client-portal.html`

Try logging in with admin credentials

---

## 🔐 Step 7: SSL Certificate

### For Vercel/Netlify
Automatic! They provide free SSL.

### For Your Own Server
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📈 Step 8: Monitor & Maintain

### Logs
```bash
# Backend logs
pm2 logs balu-backend

# View all PM2 processes
pm2 list
```

### Backups
1. Backup Supabase regularly
2. Backup database exports
3. Keep `.env` file safe

### Updates
```bash
# Pull latest code
git pull origin main

# Restart backend
pm2 restart balu-backend
```

---

## 🚨 Troubleshooting

### CORS Errors
- Check `CORS_ORIGIN` in `.env`
- Verify frontend domain matches

### 404 on Frontend
- Check Nginx config
- Verify `try_files` directive

### Database Connection Failed
- Verify Supabase credentials
- Check network access
- Verify RLS policies

### Files Not Uploading
- Check storage bucket exists
- Verify bucket is public
- Check file size limits

---

## 📞 Support

For issues:
1. Check logs: `pm2 logs`
2. Check Supabase dashboard
3. Verify environment variables
4. Contact: baluassociates.net@gmail.com

---

## ✅ Deployment Checklist

- [ ] `.env` file created (not committed)
- [ ] Supabase production project set up
- [ ] Storage bucket created
- [ ] CORS origins updated
- [ ] Frontend API URL updated
- [ ] SSL certificate installed
- [ ] Backend running (PM2 or similar)
- [ ] Frontend deployed
- [ ] Login tested
- [ ] File upload tested
- [ ] Backups configured

---

**Your portal is now production-ready!** 🎉
