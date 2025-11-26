# 🗄️ Supabase Setup - Complete Step-by-Step Guide

## What is Supabase?
Supabase is your database and authentication system. It stores all your companies, files, users, and handles login/logout.

---

## STEP 1: Create Supabase Account (2 minutes)

### 1.1 Go to Supabase Website
1. Open browser
2. Go to: **https://supabase.com**
3. Click **"Start your project"** (green button)

### 1.2 Sign Up
**Option A - GitHub (Recommended):**
1. Click **"Continue with GitHub"**
2. Login to GitHub
3. Click **"Authorize Supabase"**

**Option B - Email:**
1. Click **"Sign up with email"**
2. Enter your email
3. Create password
4. Check email for verification link
5. Click verification link

✅ **You're now logged into Supabase!**

---

## STEP 2: Create New Project (3 minutes)

### 2.1 Create Project
1. You'll see dashboard
2. Click **"New Project"** (green button)
3. If asked, create an organization first:
   - Organization name: **"Balu Associates"**
   - Click **"Create organization"**

### 2.2 Fill Project Details
```
Project Name: Balu Associates Portal
Database Password: [Create strong password - SAVE THIS!]
Region: Mumbai (ap-south-1) [Choose closest to India]
Pricing Plan: Free
```

**IMPORTANT:** Write down your database password!
```
Database Password: ___________________________
```

4. Click **"Create new project"**
5. Wait 2-3 minutes (you'll see "Setting up project...")

✅ **Project Created!**

---

## STEP 3: Get Your Credentials (2 minutes)

### 3.1 Find API Settings
1. In left sidebar, click **"Settings"** (gear icon at bottom)
2. Click **"API"**

### 3.2 Copy These Values

**Project URL:**
1. Find "Project URL" section
2. Copy the URL (looks like: `https://abcdefgh.supabase.co`)
3. Save it:
```
SUPABASE_URL: ___________________________
```

**Anon Key:**
1. Scroll down to "Project API keys"
2. Find "anon public" key
3. Click **"Copy"** button
4. Save it:
```
SUPABASE_ANON_KEY: ___________________________
```

**Service Role Key:**
1. Find "service_role" key (below anon key)
2. Click **"Reveal"** button
3. Click **"Copy"** button
4. Save it:
```
SUPABASE_SERVICE_KEY: ___________________________
```

✅ **Credentials Saved!**

---

## STEP 4: Create Database Tables (5 minutes)

### 4.1 Open SQL Editor
1. In left sidebar, click **"SQL Editor"** (icon looks like </> )
2. Click **"New Query"** button

### 4.2 Copy and Paste SQL
Copy this entire SQL code and paste into the SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'company')),
    company_id UUID,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    category TEXT NOT NULL,
    expiry_date DATE,
    storage_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_by UUID[] DEFAULT '{}'
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

-- Document requests table
CREATE TABLE document_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Activity log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_files_company_id ON files(company_id);
CREATE INDEX idx_files_expiry_date ON files(expiry_date);
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_requests_company_id ON document_requests(company_id);
CREATE INDEX idx_activity_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_timestamp ON activity_log(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- RLS Policies for companies
CREATE POLICY "Companies can view own data" ON companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- RLS Policies for files
CREATE POLICY "Companies can view own files" ON files
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for notifications
CREATE POLICY "Companies can view own notifications" ON notifications
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for document requests
CREATE POLICY "Companies can view own requests" ON document_requests
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Companies can create requests" ON document_requests
    FOR INSERT WITH CHECK (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for activity log
CREATE POLICY "Users can view own activity" ON activity_log
    FOR SELECT USING (user_id = auth.uid());
```

### 4.3 Run SQL
1. Click **"Run"** button (or press Ctrl+Enter)
2. Wait 2-3 seconds
3. You should see: **"Success. No rows returned"**

### 4.4 Verify Tables Created
1. In left sidebar, click **"Table Editor"**
2. You should see these tables:
   - users
   - companies
   - files
   - notifications
   - document_requests
   - activity_log

✅ **Database Tables Created!**

---

## STEP 5: Create Admin User (5 minutes)

### 5.1 Create Auth User
1. In left sidebar, click **"Authentication"**
2. Click **"Users"** tab
3. Click **"Add user"** dropdown
4. Click **"Create new user"**

### 5.2 Fill Admin Details
```
Email: admin@baluassociates.net
Password: admin123
Auto Confirm User: ✅ CHECK THIS BOX
```

5. Click **"Create user"**

### 5.3 Add Admin Role (Using SQL - Easier Method)
Since Supabase UI doesn't allow direct metadata editing, we'll use SQL instead:

1. Go to **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste this SQL:
```sql
-- Update the user metadata to add admin role
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@baluassociates.net';
```
4. Click **"Run"**
5. You should see: **"Success. 1 rows affected"**

### 5.4 Add Admin to Users Table
Now add the admin user to your users table:

1. Stay in **"SQL Editor"** (or open a new query)
2. Copy and paste this SQL:
```sql
-- Add admin user to users table
INSERT INTO users (id, email, role, company_id, company_name)
SELECT 
    id,
    'admin@baluassociates.net',
    'admin',
    NULL,
    NULL
FROM auth.users
WHERE email = 'admin@baluassociates.net';
```
3. Click **"Run"**
4. You should see: **"Success. 1 rows affected"**

**Note:** This automatically gets the user ID from the auth.users table, so you don't need to copy/paste it manually!

✅ **Admin User Created!**

---

## STEP 6: Verify Everything (2 minutes)

### 6.1 Check Users Table
1. Go to **"Table Editor"**
2. Click **"users"** table
3. You should see 1 row with:
   - email: admin@baluassociates.net
   - role: admin

### 6.2 Check Authentication
1. Go to **"Authentication"** → **"Users"**
2. You should see 1 user
3. Status should be green (confirmed)

✅ **Database Setup Complete!**

---

## STEP 7: Set Up File Storage (3 minutes)

### 7.1 Create Storage Bucket
1. In left sidebar, click **"Storage"** (folder icon)
2. Click **"New bucket"** button (green button)

### 7.2 Configure Bucket
```
Name: company-files
Public bucket: ✅ CHECK THIS BOX
```
3. Click **"Create bucket"**

### 7.3 Set Storage Policies
1. Click on **"company-files"** bucket
2. Click **"Policies"** tab at the top
3. Click **"New Policy"** button

**Policy 1 - Allow viewing files:**
1. Click **"For full customization"**
2. Policy name: `Allow authenticated users to view files`
3. Allowed operation: **SELECT**
4. Target roles: **authenticated**
5. USING expression:
```sql
bucket_id = 'company-files'
```
6. Click **"Review"** then **"Save policy"**

**Policy 2 - Allow uploading files:**
1. Click **"New Policy"** again
2. Policy name: `Allow authenticated users to upload files`
3. Allowed operation: **INSERT**
4. Target roles: **authenticated**
5. WITH CHECK expression:
```sql
bucket_id = 'company-files'
```
6. Click **"Review"** then **"Save policy"**

**Policy 3 - Allow deleting files:**
1. Click **"New Policy"** again
2. Policy name: `Allow authenticated users to delete files`
3. Allowed operation: **DELETE**
4. Target roles: **authenticated**
5. USING expression:
```sql
bucket_id = 'company-files'
```
6. Click **"Review"** then **"Save policy"**

✅ **Storage Setup Complete!**

---

## ✅ Supabase Setup Complete!

---

## 📝 Your Supabase Credentials Summary

Write these down or save in a secure file:

```
SUPABASE_URL=https://_____.supabase.co
SUPABASE_ANON_KEY=eyJhbGc_____
SUPABASE_SERVICE_KEY=eyJhbGc_____
ADMIN_USER_ID=_____-_____-_____
Database Password=_____
```

---

## 🆘 Troubleshooting

**Can't create project?**
- Try different browser
- Clear cache and cookies
- Use incognito mode

**SQL fails to run?**
- Make sure you copied ALL the SQL
- Check for any missing characters
- Try running in smaller chunks

**Admin user not working?**
- Verify "Auto Confirm User" was checked
- Check user metadata has "role": "admin"
- Verify user was added to users table

**Tables not showing?**
- Refresh the page
- Check SQL ran successfully
- Look for error messages in SQL editor

---

## ✅ Next Step

Your Supabase setup is complete! Now configure your backend:

1. Go to `backend` folder
2. Copy `.env.example` to `.env`
3. Fill in your Supabase credentials
4. Run `npm install`
5. Run `npm start`

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Email: baluassociates.net@gmail.com
- Phone: +91 9535725179
