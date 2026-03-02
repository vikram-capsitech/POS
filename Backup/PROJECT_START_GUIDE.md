# Project Startup Guide

## Prerequisites

- **Node.js**: v18 or higher recommended.
- **npm**: v9 or higher.
- **MongoDB**: Access to a MongoDB instance (likely Atlas).

## 1. Initial Setup (First Time Only)

Run these commands in your terminal to install dependencies for all three projects.

### Backend

```bash
cd Jumbo-backend
npm install
# Create .env file with:
# MONGO_URI=your_mongodb_uri
# PORT=5001
# ADMIN_WEB_ORIGIN=http://localhost:5173
```

### Admin Dashboard (Host)

```bash
cd ../Jumbo-admin
npm install
# Create .env file if needed
```

### POS Module (Remote)

```bash
cd ../Jumbo-POS
npm install
```

---

## 2. Starting the Application

You need to run three separate terminal instances.

### Terminal 1: Backend API

```bash
cd Jumbo-backend
npm run dev
# Expected Output: Server running on port 5001
```

### Terminal 2: POS Module (Remote)

**Crucial**: The POS module MUST be built and previewed to work with Module Federation locally. running `npm run dev` might cause issues with `remoteEntry.js` serving HTML instead of JS.

```bash
cd Jumbo-POS
npm run build && npm run preview
# Expected Output: Local: http://localhost:3001/
```

### Terminal 3: Admin Dashboard (Host)

```bash
cd Jumbo-admin
npm run dev
# Expected Output: Local: http://localhost:5173/
```

---

## 3. Accessing the App

1.  Open your browser to `http://localhost:5173`.
2.  Login with Super Admin credentials.
3.  Navigate to **POS** in the sidebar to see the integrated module.

## Troubleshooting

- **POS Module Failed to Load**: Ensure `Jumbo-POS` is running on port **3001** and responds to `curl -I http://localhost:3001/assets/remoteEntry.js` with a 200 OK and `Content-Type: text/javascript`.
- **Backend Error**: Check if port **5001** is free. If `EADDRINUSE`, kill the process using that port.
