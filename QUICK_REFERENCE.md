# Quick Reference - 11 RPL 1

## 🚀 Quick Start

### 1. Run Website
```bash
# Option A: Live Server (VS Code)
Right-click index.html → Open with Live Server

# Option B: Python
python -m http.server 8000

# Option C: Node.js
npm install -g http-server
http-server
```

Then open browser: `http://localhost:8000` or `http://127.0.0.1:5500`

### 2. Configure Supabase
```javascript
// File: js/supabase.js

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-public-key-here';
```

### 3. Deploy to GitHub
```bash
git init
git add .
git commit -m "Initial commit: 11 RPL 1 website"
git remote add origin https://github.com/USERNAME/11-rpl-1.git
git push -u origin main
```

---

## 🎨 Customization Quick Commands

### Change Theme Colors
```css
/* File: css/style.css */

:root {
    --primary-bg: #0f1419;
    --accent-color: #3b82f6;
    --text-primary: #f0f4f8;
}
```

### Edit Student Data
```javascript
// File: js/students.js

const students = [
    {
        id: 1,
        name: "Nama Siswa", // Edit nama di sini
        attendance: "01",    // Jangan ubah!
    }
]
```

### Edit Quotes/Facts/Challenges
```javascript
// File: js/students.js

const quotes = ["Quote baru"];
const facts = ["Fakta baru"];
const challenges = ["Challenge baru"];
```

---

## 🔐 Supabase Setup Checklist

```
[ ] Create Supabase project
[ ] Get Project URL
[ ] Get Public/Anon Key
[ ] Run SQL schema (profiles + gallery table)
[ ] Create storage buckets (student-avatars, student-photos)
[ ] Enable RLS on profiles table
[ ] Enable RLS on gallery table
[ ] Create SELECT policy (public read)
[ ] Create INSERT policy (auth user)
[ ] Create UPDATE policy (owner only)
[ ] Create DELETE policy (owner only)
```

---

## 🐛 Common Issues & Solutions

### Issue: "Supabase belum dikonfigurasi"
**Solution:**
```javascript
// Check js/supabase.js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // Edit ini
const SUPABASE_ANON_KEY = 'your_anon_public_key_here'; // Edit ini
```

### Issue: Login/Register tidak bekerja
**Solution:**
- Check browser console (F12)
- Ensure Supabase library loaded
- Check credentials in js/supabase.js
- Verify database tables exist

### Issue: Upload foto gagal
**Solution:**
- Check file size (< 10MB)
- Check file format (JPG/PNG/WebP)
- Verify storage bucket exists
- Check browser console for error

### Issue: Theme tidak tersimpan
**Solution:**
- Check if localStorage enabled
- Try normal mode (not Incognito)
- Clear browser cache

### Issue: 404 on GitHub Pages
**Solution:**
- Check repository is public
- Check Settings → Pages configured
- Ensure index.html in root folder
- Wait 1-5 minutes after push

---

## 📁 File Locations

```
File                          Location
------------------------------------------------------
Main HTML                     /index.html
Login                         /login.html
Register                      /register.html
Dashboard                     /dashboard.html
Main CSS                      /css/style.css
Supabase Config               /js/supabase.js (⭐ EDIT THIS)
Student Data                  /js/students.js
Home Page Script              /js/script.js
Auth Script                   /js/auth.js
Dashboard Script              /js/dashboard.js
Student Photos                /assets/images/students/
Documentation                 /README.md
Setup Guide                   /SETUP_GUIDE.md
This File                     /QUICK_REFERENCE.md
Git Ignore                    /.gitignore
```

---

## 🎯 Testing Checklist

```
HOME PAGE
[ ] Navbar appears correctly
[ ] Theme toggle works (Light/Dark/BLACKPINK)
[ ] Hero section visible
[ ] Statistics display
[ ] Student cards show
[ ] Search works
[ ] Student modal opens on click
[ ] Gallery filters work
[ ] Lightbox works
[ ] Random Zone buttons work
[ ] Clock shows current time
[ ] Responsive on mobile

LOGIN
[ ] Email validation works
[ ] Password field shows/hides correctly
[ ] Error messages display
[ ] Redirect to dashboard on success

REGISTER
[ ] Attendance number dropdown filled
[ ] Email validation works
[ ] Password confirmation works
[ ] Attendance number unique check works
[ ] Success message shows
[ ] Redirect to login works

DASHBOARD
[ ] User profile loads
[ ] Edit profile form works
[ ] Avatar upload preview works
[ ] Upload photo works
[ ] My gallery shows uploaded photos
[ ] Delete photo works
[ ] Logout works
[ ] Responsive layout
```

---

## 📊 Database Schema Quick Reference

```sql
-- PROFILES
id (uuid, PK)
name (text)
attendance_number (int, unique 1-37)
email (text)
avatar_url (text)
bio (text)
quote (text)
role (text, default: 'student')
created_at (timestamp)
updated_at (timestamp)

-- GALLERY
id (uuid, PK)
user_id (uuid, FK → profiles.id)
image_url (text)
caption (text)
category (text)
created_at (timestamp)
```

---

## 🔑 Important Credentials to Keep Safe

```
❌ NEVER share these:
- Service Role Key
- Database Password
- JWT Secret

✅ SAFE to share:
- Project URL
- Public/Anon Key (client-side only)
- GitHub repository (if public)
```

---

## 📞 Quick Help Links

- Supabase Docs: https://supabase.com/docs
- GitHub Pages: https://pages.github.com
- CSS Variables: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- JavaScript Fetch: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

---

## 🎓 Code Examples

### Get Student by Attendance
```javascript
const student = window.studentsData.getStudentByAttendance('01');
console.log(student.name); // "Siswa 01"
```

### Get Random Student
```javascript
const random = window.studentsData.getRandomStudent();
console.log(random);
```

### Get Random Quote
```javascript
const quote = window.studentsData.getRandomQuote();
console.log(quote);
```

### Change Theme Programmatically
```javascript
themeManager.setTheme('blackpink'); // 'dark', 'light', 'blackpink'
```

### Check if User Logged In
```javascript
const isLoggedIn = authManager.isLoggedIn();
console.log(isLoggedIn);
```

---

## 🚀 Deployment Checklist

```
BEFORE PUSHING TO GITHUB
[ ] Remove/mask credentials from js/supabase.js
[ ] Check .gitignore includes sensitive files
[ ] Test website locally
[ ] Check console for errors (F12)
[ ] Verify all links work
[ ] Test responsive design

AFTER PUSHING
[ ] Enable GitHub Pages in Settings
[ ] Set branch to main, folder to root
[ ] Wait 2-5 minutes
[ ] Visit https://USERNAME.github.io/11-rpl-1
[ ] Test live website
[ ] Share link with classmates
```

---

## 💾 Backup Commands

```bash
# Backup Supabase Database
1. Go to Supabase Dashboard
2. Settings → Backups
3. Click "Request a backup"

# Backup Local Project
1. Copy entire folder
2. Archive with 7-Zip or WinRAR
3. Keep in safe place

# Backup to GitHub
git push origin main
```

---

## 📈 Performance Optimization

✅ Already optimized:
- CSS variables for theme switching
- Lazy loading images
- Minimal dependencies (no jQuery, Bootstrap)
- Semantic HTML
- Responsive images

💡 Tips:
- Compress images to < 100KB each
- Use WebP format for better compression
- Cache busting for CSS/JS if needed
- Monitor bundle size

---

## 🎉 You're All Set!

Website 11 RPL 1 adalah:
- ✅ Fully functional
- ✅ Production ready
- ✅ Secure with RLS
- ✅ Beautiful UI/UX
- ✅ Mobile responsive
- ✅ Easy to customize

**Now go launch it! 🚀**

---

**Quick Reference v1.0**
Last updated: 31 August 2026
