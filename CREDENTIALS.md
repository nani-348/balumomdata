# 🔐 Login Credentials & Setup

## Admin Account

**Email:** `baluassociaties143@gmail.com`  
**Password:** `Hrishi$1604`

### Admin Access:
- Manage companies
- Upload files
- Send notifications
- View activity logs
- Create document requests

---

## Company Accounts

Companies are created by the admin in the portal.

### How to Create a Company Account:

1. **Login as Admin**
   - Email: `baluassociaties143@gmail.com`
   - Password: `Hrishi$1604`

2. **Go to Companies Tab**
   - Click "Add Company" button

3. **Fill Company Details**
   - Company Name: (e.g., "ABC Pvt Ltd")
   - Email: (e.g., "abc@company.com")
   - Password: (Set a strong password)
   - Phone: (Optional)

4. **Company Can Login With:**
   - Email: The email you set
   - Password: The password you set

### Company Access:
- View files uploaded by admin
- Download documents
- View notifications
- Request documents
- Change password (optional)

---

## Default Test Credentials

If you want to test with pre-created accounts, create them in Supabase:

### Test Admin
- Email: `admin@test.com`
- Password: `Admin@123456`

### Test Company
- Email: `company@test.com`
- Password: `Company@123456`

---

## 🔒 Security Notes

1. **Never share passwords** - Each user should have their own credentials
2. **Change default password** - Admin should change password after first login
3. **Strong passwords** - Use at least 8 characters with mix of letters, numbers, symbols
4. **Session timeout** - Sessions expire after 30 minutes of inactivity
5. **Secure storage** - Passwords are hashed in Supabase Auth

---

## 🆘 Forgot Password?

Currently, there's no password reset feature. To reset:

1. Go to Supabase Dashboard
2. Go to Authentication → Users
3. Find the user
4. Click "Reset Password" or delete and recreate the user

---

## 📝 Creating Multiple Companies

**Example:**

```
Company 1:
- Name: Rainbow Arts
- Email: rainbow@company.com
- Password: Rainbow@123

Company 2:
- Name: New Star Enterprises
- Email: newstar@company.com
- Password: NewStar@123

Company 3:
- Name: Tech Solutions
- Email: tech@company.com
- Password: TechSol@123
```

Each company can then login with their own credentials and see only their files and notifications.

---

## 🚀 First Time Setup

1. Login as admin with credentials above
2. Create at least one company
3. Upload a test file to that company
4. Logout and login as the company
5. Verify you can see the uploaded file

---

**For more help, contact:** baluassociates.net@gmail.com
