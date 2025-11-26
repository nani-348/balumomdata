# Balu Associates - Tax & GST Solutions

Complete website with secure client portal for file sharing.

## 🌟 Features

### Main Website
- Professional business website
- Services showcase
- GST Calculator
- Consultation booking
- Contact forms
- Mobile responsive

### Client Portal
- **Admin Dashboard**: Manage companies, upload files, send notifications
- **Company Dashboard**: View files, download documents, request files
- **File Management**: Upload to Supabase Storage
- **Activity Tracking**: Complete audit log
- **Notifications**: Send messages to companies
- **Security**: JWT auth, session timeout

## 📁 Project Structure

```
BaluAssociates/
├── index.html              # Main website
├── client-portal.html      # Portal interface
├── portal-app.js           # Portal logic
├── portal-api.js           # API client
├── styles.css              # Main styles
├── portal-styles.css       # Portal styles
├── script.js               # Main website JS
├── backend/                # Node.js API
│   ├── config/            # Supabase config
│   ├── routes/            # API endpoints
│   └── server.js          # Express server
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Setup Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL from `SUPABASE_SETUP.md` to create tables
4. Create storage bucket `company-files` (public)
5. Create admin user in Authentication

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
python3 -m http.server 8000
```

### 4. Open Portal
```
http://localhost:8000/client-portal.html
```

## 🔐 Environment Variables

Create `backend/.env` with:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:8000
```

⚠️ **Never commit `.env` file to GitHub!**

## 🛠️ Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Font Awesome icons
- Responsive design

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL + Auth + Storage)
- JWT authentication

## 📞 Contact

**Balu Associates**
- Email: baluassociates.net@gmail.com
- Phone: +91 9535725179
- Address: Bengaluru, Karnataka 560068

## 📄 License

© 2025 Balu Associates. All rights reserved.
