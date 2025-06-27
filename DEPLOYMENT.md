# Deployment Guide for Test Case Manager

This guide walks you through deploying the Test Case Manager application with:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: SQLite with Railway persistent storage

## Prerequisites

1. Create accounts on:
   - [Vercel](https://vercel.com)
   - [Railway](https://railway.app)
2. Install Git and push your code to GitHub

## Backend Deployment (Railway)

### Step 1: Prepare the Backend

1. Make sure your backend has all required files:
   - ✅ `railway.json` (already created)
   - ✅ `package.json` with build/start scripts
   - ✅ TypeScript configuration

### Step 2: Deploy to Railway

1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and choose the `/server` directory
4. Railway will auto-detect Node.js and start deployment

### Step 3: Configure Railway

1. **Add Persistent Storage**:
   - In Railway dashboard, click on your service
   - Go to "Variables" tab
   - Add a new variable: `RAILWAY_VOLUME_MOUNT_PATH=/data`
   - Go to "Settings" → "Volumes"
   - Click "Add Volume" and mount to `/data`

2. **Set Environment Variables**:
   ```
   PORT=5002
   FRONTEND_URL=https://your-app.vercel.app
   ```

3. **Generate Domain**:
   - Go to "Settings" → "Domains"
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-app.railway.app`)

## Frontend Deployment (Vercel)

### Step 1: Update Environment Variables

1. Create/update `.env.production` in the client folder:
   ```
   REACT_APP_API_URL=https://your-app.railway.app/api
   ```
   Replace with your actual Railway URL

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `REACT_APP_API_URL` = `https://your-railway-backend.railway.app/api`

6. Click "Deploy"

## Post-Deployment Steps

### 1. Update CORS Settings

After both deployments are live, update the Railway environment variable:
- `FRONTEND_URL` = Your Vercel app URL (e.g., `https://test-case-manager.vercel.app`)

### 2. Initialize Database

If needed, you can seed the database by:
1. SSH into Railway (using Railway CLI)
2. Run: `node scripts/seedTestCases.js`

Or manually add test cases through the UI.

### 3. Verify Deployment

1. Visit your Vercel URL
2. Check that the app loads
3. Try creating a test case
4. Verify data persists

## Deployment Commands Summary

### Backend (Railway)
```bash
# No commands needed - Railway auto-deploys from GitHub
# To run locally with production settings:
cd server
npm run build
npm start
```

### Frontend (Vercel)
```bash
# No commands needed - Vercel auto-deploys from GitHub
# To build locally:
cd client
npm run build
```

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check that the URL includes `https://` but no trailing slash

### Database Issues
- Verify the volume is mounted at `/data` in Railway
- Check Railway logs for database path confirmation
- Ensure the SQLite file has proper permissions

### API Connection Issues
- Verify `REACT_APP_API_URL` in Vercel includes `/api`
- Check Railway service is running (green status)
- Test the health endpoint: `https://your-backend.railway.app/api/health`

## Environment Variables Reference

### Railway (Backend)
- `PORT` - Server port (default: 5002)
- `FRONTEND_URL` - Your Vercel app URL for CORS
- `RAILWAY_VOLUME_MOUNT_PATH` - Set to `/data` for persistent storage

### Vercel (Frontend)
- `REACT_APP_API_URL` - Your Railway backend URL + `/api`

## Monitoring

- **Railway**: Check logs in the Railway dashboard
- **Vercel**: View function logs and analytics in Vercel dashboard
- **Health Check**: `GET /api/health` endpoint on backend

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Railway**: $5/month for hobby plan (includes $5 credit)
- **Total**: ~$5/month for production deployment

## Security Notes

1. Never commit `.env` files to Git
2. Use environment variables for all sensitive data
3. Keep your SQLite database in the Railway volume (not in Git)
4. Regularly backup your database from Railway

## Support

- Railway Discord: https://discord.gg/railway
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: Create issues in your repository