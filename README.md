# POS Project - Jumbo Food

This repository contains the source code for the Jumbo Food Point of Sale (POS) system, consisting of a backend server and an admin dashboard.

## Project Structure

- `Jumbo-backend`: Node.js/Express backend server.
- `Jumbo-admin`: React/Vite admin dashboard.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB Atlas Account/Connection URI

## Setup & Installation

### 1. Backend Setup (`Jumbo-backend`)

1.  Navigate to the backend directory:
    ```bash
    cd Jumbo-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    - A `.env` file has been created with the necessary configuration.
    - Ensure `MONGO_URI` is correct and accessible.
    - Update `CLOUDINARY_*` credentials if needed.

4.  Start the server:
    ```bash
    npm run dev
    ```
    The server will start on port `5000` (default).

### 2. Admin Dashboard Setup (`Jumbo-admin`)

1.  Navigate to the admin directory:
    ```bash
    cd Jumbo-admin
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    - A `.env` file has been created with default configuration.
    - Update `VITE_GOOGLE_CLIENT_ID` if you plan to use Google Login.
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## Usage

1.  Ensure the Backend is running first.
2.  Open the Admin Dashboard in your browser.
3.  Login using the Super Admin credentials (configured in backend `.env`):
    - Email: `superadmin@example.com`
    - Password: `SuperAdmin@123`

## Troubleshooting

- **MongoDB Connection Error**: Check your internet connection and verify the `MONGO_URI` in `Jumbo-backend/.env`. Whitelist your IP in MongoDB Atlas if necessary.
- **CORS Issues**: Ensure `ADMIN_WEB_ORIGIN` in `Jumbo-backend/.env` matches the URL your frontend is running on (e.g., `http://localhost:5173`).
