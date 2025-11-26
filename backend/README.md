# Balu Associates Portal - Backend API

Complete backend solution using **Supabase** (Database + Auth) and **Google Drive** (File Storage).

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── supabase.js          # Supabase client configuration
│   └── googleDrive.js       # Google Drive API setup
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── companies.js         # Company management
│   ├── files.js             # File upload/download
│   ├── notifications.js     # Notifications
│   ├── requests.js          # Document requests
│   └── activity.js          # Activity logging
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── server.js                # Main server file
├── SETUP_GUIDE.md           # Detailed setup instructions
└── README.md                # This file
```

## 🔧 Technology Stack

- **Node.js + Express**: API server
- **Supabase**: PostgreSQL database + Authentication
- **Google Drive API**: File storage
- **Multer**: File upload handling
- **JWT**: Token-based authentication
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing

## 📊 Database Schema

### Tables:
- `users` - User accounts (admin/company)
- `companies` - Company information
- `files` - File metadata
- `notifications` - System notifications
- `document_requests` - Document requests from companies
- `activity_log` - Activity tracking

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
POST   /api/auth/change-password    # Change password
```

### Companies (Admin Only)
```
GET    /api/companies               # Get all companies
POST   /api/companies               # Create company
PUT    /api/companies/:id           # Update company
DELETE /api/companies/:id           # Delete company
```

### Files
```
GET    /api/files                   # Get files
POST   /api/files/upload            # Upload files (Admin)
DELETE /api/files/:id               # Delete file (Admin)
POST   /api/files/:id/mark-read    # Mark as read (Company)
```

### Notifications
```
GET    /api/notifications           # Get notifications
POST   /api/notifications           # Send notification (Admin)
```

### Document Requests
```
GET    /api/requests                # Get requests
POST   /api/requests                # Create request (Company)
PUT    /api/requests/:id            # Update request (Admin)
```

### Activity Log
```
GET    /api/activity                # Get activity log
DELETE /api/activity                # Clear log (Admin)
```

## 🔑 Environment Variables

Required variables in `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Google Drive
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_REFRESH_TOKEN=xxx
GOOGLE_DRIVE_FOLDER_ID=xxx

# Settings
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:8000
```

## 📝 Setup Instructions

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions including:
- Supabase project setup
- Database schema creation
- Google Drive API configuration
- OAuth token generation

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@baluassociates.net","password":"admin123"}'
```

### Test File Upload
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@test.pdf" \
  -F "company_id=COMPANY_ID" \
  -F "category=Tax"
```

## 🔒 Security Features

- JWT token authentication
- Row Level Security (RLS) in Supabase
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- CORS protection
- File type validation
- File size limits

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "@supabase/supabase-js": "^2.39.0",
  "googleapis": "^128.0.0",
  "multer": "^1.4.5-lts.1",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5"
}
```

## 🚀 Deployment

### Heroku
```bash
heroku create balu-associates-api
heroku config:set SUPABASE_URL=xxx
heroku config:set SUPABASE_SERVICE_KEY=xxx
# ... set other env vars
git push heroku main
```

### Vercel
```bash
vercel
# Configure environment variables in Vercel dashboard
```

### Railway
```bash
railway init
railway up
# Configure environment variables in Railway dashboard
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Ensure tables are created

### Google Drive Upload Fails
- Verify OAuth credentials
- Check refresh token validity
- Ensure Drive API is enabled
- Verify folder permissions

### CORS Errors
- Update CORS_ORIGIN in .env
- Check frontend URL matches

## 📞 Support

For issues or questions:
- Email: baluassociates.net@gmail.com
- Phone: +91 9535725179

---

**Backend is ready to use!** 🎉
