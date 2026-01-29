# Antigravity POS & Hotel System

A unified Restaurant POS and Hotel Management System built with modern web technologies.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Material UI (MUI).
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Monorepo**: pnpm workspaces.

## Prerequisites
- Node.js (v16+)
- pnpm (`npm install -g pnpm`)
- MongoDB (Running locally on default port 27017)

## Setup & Running

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Seed Database** (Populate initial Products, Rooms, Tables)
   ```bash
   cd apps/api
   npm run seed
   ```
   *Return to root after seeding.*

3. **Start Development Servers** (Frontend + Backend)
   From the root directory:
   ```bash
   pnpm dev
   ```
   
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5000](http://localhost:5000)

## Features
- **POS**: Product grid, Cart, Order placement (Dine-in/Takeaway).
- **KDS**: Kitchen Display System with live status updates.
- **Hotel**: Room grid view.
- **Shared**: Shared constants layer.

## Folder Structure
- `apps/web`: React Frontend.
- `apps/api`: Express Backend.
- `packages/shared`: Shared constants.
