# 🚀 Deployment Guide

This guide will help you deploy your Secret Santa app to **vinnysharma.dev** using Render.

## Prerequisites

- ✅ Your code pushed to a GitHub repository
- ✅ MongoDB Atlas account (you already have this set up)
- ✅ Domain: vinnysharma.dev (you own this)
- ✅ Render account (free tier works great!)

## Step 1: Prepare Your Repository

1. **Make sure your code is committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify your environment variables:**
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string (keep this secret!)

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Sign up/Login to Render:**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account (free tier is available)

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `Cuzzy-Secret-Santa` repository

3. **Configure the Service:**
   - **Name:** `cuzzy-secret-santa` (or any name you prefer)
   - **Environment:** `Python 3`
   - **Build Command:** `npm install && npm run build && pip install -r requirements.txt`
   - **Start Command:** `gunicorn run:app`
   - **Plan:** Free (or choose a paid plan if needed)

4. **Set Environment Variables:**
   Click "Add Environment Variable" and add:
   - `MONGODB_URI` = `your-mongodb-atlas-connection-string`
   - `JWT_SECRET` = `your-secure-random-secret-key` (generate a strong random string)
   - `PORT` = `10000` (Render sets this automatically, but you can specify it)

5. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Wait for the deployment to complete (usually 5-10 minutes)

6. **Get Your App URL:**
   - Once deployed, you'll get a URL like: `https://cuzzy-secret-santa.onrender.com`
   - Test it by visiting: `https://your-app.onrender.com/api/health`

### Option B: Using render.yaml (Alternative)

If you prefer using the `render.yaml` file:

1. **Create the service:**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and configure everything

2. **Set Environment Variables:**
   - Still need to set `MONGODB_URI` and `JWT_SECRET` in the dashboard

## Step 3: Configure Your Domain (vinnysharma.dev)

1. **In Render Dashboard:**
   - Go to your web service
   - Click "Settings" → "Custom Domains"
   - Click "Add Custom Domain"
   - Enter: `vinnysharma.dev` and `www.vinnysharma.dev` (optional)

2. **Configure DNS:**
   Render will provide you with DNS records. You need to add these to your domain registrar:

   **For vinnysharma.dev:**
   - **Type:** CNAME
   - **Name:** @ (or leave blank, depends on your registrar)
   - **Value:** `your-app-name.onrender.com` (provided by Render)

   **For www.vinnysharma.dev (optional):**
   - **Type:** CNAME
   - **Name:** www
   - **Value:** `your-app-name.onrender.com`

3. **Wait for DNS Propagation:**
   - DNS changes can take 24-48 hours, but usually work within 1-2 hours
   - Render will automatically provision SSL certificates once DNS is configured

4. **Verify:**
   - Once DNS propagates, visit `https://vinnysharma.dev`
   - The site should load with a valid SSL certificate

## Step 4: Test Your Deployment

1. **Health Check:**
   - Visit: `https://vinnysharma.dev/api/health`
   - Should return: `{"status": "ok", "message": "Server is running"}`

2. **Test the App:**
   - Visit: `https://vinnysharma.dev`
   - Try logging in with one of your test users
   - Verify all features work correctly

## Step 5: Keep Your App Running (Free Tier)

⚠️ **Important:** Render's free tier spins down your app after 15 minutes of inactivity. When someone visits, it takes ~30 seconds to wake up.

**Options to keep it running:**
1. **Upgrade to a paid plan** ($7/month) - keeps the app always running
2. **Use a free uptime monitor** (like UptimeRobot) to ping your app every 5 minutes
3. **Accept the cold start** - it's free and works fine for occasional use

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Make sure all dependencies are in `requirements.txt` and `package.json`
- Verify Node.js and Python versions are compatible

### App Won't Start
- Check the logs in Render dashboard
- Verify environment variables are set correctly
- Make sure `MONGODB_URI` is correct and accessible

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct in your domain registrar
- Check Render's custom domain status page

### CORS Errors
- The Flask app already has CORS enabled
- If you see CORS errors, check that your frontend is using the correct API URL

## Alternative: Deploy to GitHub Pages (Frontend Only)

If you want to deploy just the frontend to GitHub Pages (and keep backend separate):

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   - Go to repository Settings → Pages
   - Select source branch (usually `main`)
   - Select `/dist` folder
   - Update `src/utils/api.js` to use your backend URL instead of `/api`

3. **Update API Configuration:**
   - Change `API_BASE` in `src/utils/api.js` to your backend URL
   - Rebuild and redeploy

**Note:** This requires your backend to be deployed separately and CORS to be configured properly.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes |
| `PORT` | Port number (Render sets this automatically) | ❌ No |

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Share the URL with your cuzzys!
3. ✅ Have everyone set their secret keys
4. ✅ Shuffle assignments when ready
5. ✅ Enjoy your Secret Santa! 🎁

---

**Need Help?** Check Render's documentation: [render.com/docs](https://render.com/docs)

