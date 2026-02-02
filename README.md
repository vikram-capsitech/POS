# RestoPOS - Advanced Restaurant Management System

RestoPOS is a full-stack Point of Sale and Management system designed for modern restaurants. It features a robust Admin Dashboard, specific interfaces for Waiters and Kitchen Staff, and a customer-facing QR Menu.

## 🚀 Features

- **Admin Dashboard**: Analytics, Menu Management, Table Management, Staff Management.
- **Waiter POS**: Table selection, detailed order taking, AI-driven staff assignment, bill splitting/payment.
- **Kitchen Display System (KDS)**: Real-time order tracking, status updates.
- **QR Menu**: Customer self-ordering via QR code scanning.
- **AI Integrations**: Smart notifications and staff allocation logic.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Material UI, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **State Management**: React Hooks & Context.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas connection string)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd RestoPOS
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure the environment.

```bash
cd backend
npm install
```

**Configuration (.env):**
Create a `.env` file in the `backend` folder with the following content:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```
*(Replace `your_mongodb_connection_string` with your actual MongoDB URI)*

**Seed Data (Optional):**
To populate the database with initial sample data (Menu Items, Tables):
```bash
npm run data:import
```

**Start the Backend Server:**
```bash
npm run dev
# Server should run on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal window, navigate to the project root, and install dependencies.

```bash
# If you are in the backend folder, go back to root
cd .. 

npm install
```

**Start the Frontend Application:**
```bash
npm run dev
# Application will run on http://localhost:5173 (usually)
```

---

## 📱 Usage Guide

Once both servers are running, open your browser and access the application (typically `http://localhost:5173`).

### Navigation
The app provides a top navigation bar to switch between different role-based views (for demonstration purposes):

1.  **Admin**: The main dashboard for owners/managers.
2.  **Waiter POS**:
    *   **Floor Plan**: Select tables.
    *   **Menu**: Take orders.
    *   **Features**: AI Staff badges on tables, Kitchen Notifications (Bell icon).
3.  **Kitchen**: View incoming orders and update statuses (Pending -> Preparing -> Ready).
4.  **QR Menu**: Simulates a customer scanning a table QR code to place their own orders.

---

## 🔧 Troubleshooting

- **Connection Refused**: Ensure the backend server is running on port 5000.
- **Database Error**: Check your `MONGO_URI` in `backend/.env`.
- **"Module not found"**: Run `npm install` in both root and backend directories to ensure all dependencies are downloaded.

---

## 🤝 Contribution

Feel free to open issues or submit pull requests for improvements.

**License**: ISC