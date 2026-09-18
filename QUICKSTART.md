# NeuroVision AI Platform - QUICKSTART GUIDE

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js v16+ installed
- MongoDB installed and running locally (or MongoDB Atlas account)

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Setup Database

Make sure MongoDB is running locally, or update the `MONGODB_URI` in `server/.env` with your MongoDB Atlas connection string.

```bash
# Seed the database with demo data
npm run seed
```

You should see:
```
✅ Database seeded successfully!

Demo Credentials:
Admin: admin@neurovision.com / admin123
User: sarah@neurovision.com / user123
```

### Step 3: Start Backend Server

```bash
npm run dev
```

You should see:
```
MongoDB Connected: localhost
Server running in development mode on port 5000
```

### Step 4: Install Frontend Dependencies

Open a NEW terminal and navigate to the client folder:

```bash
cd client
npm install
```

This will install all dependencies (may take 2-3 minutes).

### Step 5: Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
```

### Step 6: Open the Application

Open your browser and go to: **http://localhost:3000**

You'll see the landing page. Click "Start Analysis" to go to the login page.

### Step 7: Login

Use one of these credentials:

**Admin Account:**
- Email: `admin@neurovision.com`
- Password: `admin123`

**User Account:**
- Email: `sarah@neurovision.com`
- Password: `user123`

---

## 📋 Complete User Journey Demo

To showcase the full functionality to your examiners:

### 1. Login
- Navigate to http://localhost:3000/login
- Login with admin credentials
- You'll be redirected to the Dashboard

### 2. Upload MRI Scan
- Click "MRI Upload" in sidebar
- Enter Patient ID (e.g., "PAT-5001")
- Select Modality: "T1-weighted"
- Select Source: "BraTS"
- Click "Register Scan"
- See success toast notification

### 3. Preprocess Scan
- Click "Preprocessing" in sidebar
- Select your uploaded scan from dropdown
- Click "Run Pipeline"
- Watch the 5 steps complete one by one with animations
- See "Preprocessing Complete" toast

### 4. Segment Tumor
- Click "Segmentation" in sidebar
- Select your preprocessed scan
- Select Model: "U-Net"
- Click "Run Segmentation"
- Wait for processing (3-5 seconds)
- View metrics cards (Dice Score, IoU, etc.)
- See tumor classification and analysis

### 5. 3D Reconstruction (WOW FACTOR!)
- Click "3D Reconstruction" in sidebar
- Select your segmented scan
- Click "Generate 3D Model"
- Watch the loading animation
- Interact with the 3D brain model:
  - **Rotate**: Click and drag
  - **Zoom**: Scroll wheel
  - **Pan**: Right-click drag
  - Try the controls panel on the right
  - Toggle wireframe, brain outline, etc.

### 6. View Results
- Click "Results" in sidebar
- View analytics charts
- See clinical summary
- Check risk score and recommendations

### 7. Generate Report
- Click "Reports" in sidebar
- Select a scan
- Click "Generate Report"
- PDF will download automatically
- See report in "Recent Reports" list

### 8. Admin Panel (Admin account only)
- Click "Admin Panel" in sidebar
- View system statistics
- Check system health
- View users table
- View all scans
- Delete scans if needed

### 9. Logout
- Click "Logout" in sidebar
- Confirm in modal
- Redirected to login page

---

## 🎨 Features to Showcase

### Premium UI/UX
- Glassmorphism cards with blur effects
- Smooth animations and transitions
- Dark mode toggle (click moon icon in sidebar)
- Responsive design (try resizing browser)
- Hover effects on cards and buttons
- Loading states and skeleton loaders
- Toast notifications

### Dashboard
- Animated stat counters
- Interactive charts (Recharts)
- Recent scans with color-coded statuses
- Real-time data from backend

### 3D Visualization
- Rotating 3D brain model
- Glowing tumor visualization
- Interactive controls
- Real-time metrics
- Professional medical visualization

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas (cloud database)
- Update `MONGODB_URI` in `server/.env`

### Port Already in Use
- Backend: Change `PORT` in `server/.env`
- Frontend: Change `port` in `client/vite.config.ts`

### Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Frontend Can't Connect to Backend
- Make sure backend is running on port 5000
- Check `client/vite.config.ts` proxy configuration
- Check browser console for errors

---

## 📦 Project Structure

```
MAJORPROJECT/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # Mongoose models (User, Scan, Report)
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & error handling
│   │   └── utils/         # Seed script
│   └── package.json
│
├── client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API calls
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app with routing
│   │   └── main.tsx       # Entry point
│   └── package.json
│
└── README.md
```

---

## 🎯 Exam Presentation Tips

### What to Highlight:
1. **Full-stack architecture** - React frontend + Node.js backend + MongoDB
2. **Authentication system** - JWT tokens, protected routes
3. **State management** - Zustand for global state
4. **Real-time updates** - Status changes reflect across all pages
5. **3D visualization** - React Three Fiber with bloom effects
6. **Clinical workflow** - Complete pipeline from upload to report
7. **Premium UI** - Glassmorphism, animations, dark mode
8. **Responsive design** - Works on all devices

### Demo Flow:
1. Show landing page (30 seconds)
2. Login and show dashboard (30 seconds)
3. Upload → Preprocess → Segment → 3D (2 minutes)
4. Show results and generate report (1 minute)
5. Show admin panel (30 seconds)
6. Show dark mode toggle (10 seconds)

---

## 📝 Additional Notes

- All MRI scan data is mock/realistic data for demonstration
- 3D model uses parametric geometry (not actual MRI DICOM data)
- Segmentation results are randomly generated but realistic
- PDF reports are generated client-side using jsPDF
- The application is designed for educational/demo purposes

---

## 🆘 Need Help?

If you encounter any issues:
1. Check this guide's troubleshooting section
2. Check browser console for frontend errors
3. Check terminal for backend errors
4. Make sure both servers are running
5. Verify MongoDB is connected

---

**Good luck with your major project presentation! 🎓✨**
