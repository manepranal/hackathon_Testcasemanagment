# Deployment Checklist

## Pre-Deployment
- [ ] Push all code to GitHub
- [ ] Test locally with `npm run dev`
- [ ] Build locally to check for errors: `npm run build:all`

## Railway Backend Deployment
- [ ] Create new Railway project
- [ ] Connect GitHub repository
- [ ] Set root directory to `/server`
- [ ] Add environment variables:
  - [ ] `PORT=5002`
  - [ ] `FRONTEND_URL=` (add after Vercel deployment)
  - [ ] `RAILWAY_VOLUME_MOUNT_PATH=/data`
- [ ] Add persistent volume mounted at `/data`
- [ ] Generate public domain
- [ ] Copy backend URL: `https://_____.railway.app`

## Vercel Frontend Deployment  
- [ ] Create new Vercel project
- [ ] Connect GitHub repository
- [ ] Set root directory to `/client`
- [ ] Add environment variable:
  - [ ] `REACT_APP_API_URL=https://[your-railway-url]/api`
- [ ] Deploy
- [ ] Copy frontend URL: `https://_____.vercel.app`

## Post-Deployment
- [ ] Update Railway `FRONTEND_URL` with Vercel URL
- [ ] Redeploy Railway if needed
- [ ] Test health endpoint: `[railway-url]/api/health`
- [ ] Test creating a test case
- [ ] Test reading test cases
- [ ] Verify data persists after Railway restart

## Verification
- [ ] Frontend loads without errors
- [ ] Can create new test cases
- [ ] Can view existing test cases
- [ ] Can run test cases
- [ ] Can export/import test cases
- [ ] Text-to-speech works

## Production URLs
- Frontend: `_____________________`
- Backend: `_____________________`
- Health Check: `_____________________/api/health`