# Deployment Guide (Vercel)

This guide covers deploying all three components of the Jumbo POS system to Vercel.

## 1. Backend Deployment (`Jumbo-backend`)

Vercel requires a configuration change to deploy a standard Express app as a serverless function.

1.  **Modify `vercel.json`** in `Jumbo-backend`:
    Change `"src": "api/index.js"` to `"src": "src/index.js"` (since your entry point is `src/index.js`).
    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "src/index.js",
          "use": "@vercel/node"
        }
      ],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "/src/index.js"
        }
      ]
    }
    ```
2.  **Push to GitHub**.
3.  **Import to Vercel**:
    - Select the `Jumbo-backend` directory as the Root Directory.
    - Set Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.).
    - Deploy.
4.  **Note the URL**: e.g., `https://jumbo-backend.vercel.app`.

---

## 2. POS Module Deployment (`Jumbo-POS`)

This must be deployed **before** the Admin Dashboard so you have the remote URL.

1.  **Configure `vite.config.js`**:
    Ensure `federation` plugin is active. Vercel handles the build automatically.
2.  **Push to GitHub**.
3.  **Import to Vercel**:
    - Select `Jumbo-POS` as Root Directory.
    - Framework Preset: **Vite**.
    - Deploy.
4.  **Note the URL**: e.g., `https://jumbo-pos.vercel.app`.
5.  **Note the Remote Entry URL**: `https://jumbo-pos.vercel.app/assets/remoteEntry.js`.

---

## 3. Admin Dashboard Deployment (`Jumbo-admin`)

1.  **Configure Remote URL**:
    In `vite.config.js`, the remote URL is currently hardcoded to `http://localhost:3001/...`. You need to change this for production.

    **Option A: Hardcode Production URL (Easiest for now)**
    Replace the localhost URL with your deployed POS URL (`https://jumbo-pos.vercel.app/assets/remoteEntry.js`) before committing.

    **Option B: Environment Variable (Recommended)**
    Update `vite.config.js` to use `process.env.VITE_POS_REMOTE_URL`.

    ```javascript
    remotes: {
      pos_app: process.env.VITE_POS_REMOTE_URL || 'http://localhost:3001/assets/remoteEntry.js',
    }
    ```

2.  **Push to GitHub**.
3.  **Import to Vercel**:
    - Select `Jumbo-admin` as Root Directory.
    - Framework Preset: **Vite**.
    - **Environment Variables**:
      - `VITE_API_URL`: Set to your deployed Backend URL (e.g., `https://jumbo-backend.vercel.app`).
      - `VITE_POS_REMOTE_URL`: If using Option B, set to `https://jumbo-pos.vercel.app/assets/remoteEntry.js`.
    - Deploy.

## 4. Final Configuration

Once all three are deployed:

1.  **Update Backend CORS**:
    Go to Vercel -> Jumbo-backend -> Settings -> Environment Variables.
    Update `ADMIN_WEB_ORIGIN` to your deployed Admin Dashboard URL (e.g., `https://jumbo-admin.vercel.app`).
2.  **Redeploy Backend** for changes to take effect.
