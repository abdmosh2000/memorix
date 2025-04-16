# Deploying Memorix Frontend to Render

This guide provides detailed instructions for deploying the Memorix frontend on Render.

## Why Render for Frontend?

- **Build Time**: No strict build time limits compared to Vercel
- **Static Site Hosting**: Free tier for static site hosting
- **Simple Configuration**: Easy setup with render.yaml
- **Unified Platform**: Can host both frontend and backend on the same platform

## Prerequisites

1. A [Render](https://render.com/) account
2. Your project code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### Option 1: Deploy from Dashboard (Recommended for First-time Setup)

1. **Sign In to Render**:
   - Go to [render.com](https://render.com/) and sign in

2. **Create New Static Site**:
   - Click on "New +" button
   - Select "Static Site"

3. **Connect Repository**:
   - Connect to your GitHub/GitLab repository
   - Select the repository containing your Memorix project

4. **Configure Settings**:
   - **Name**: Choose a name (e.g., "memorix-frontend")
   - **Root Directory** (if using monorepo): `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. **Environment Variables**:
   - Add `NODE_ENV` = `production`
   - Add `REACT_APP_API_URL` = `https://your-backend-url.onrender.com/api`

6. **Create Static Site**:
   - Click "Create Static Site"

### Option 2: Deploy using render.yaml (For CI/CD)

1. **Add render.yaml**:
   - We've already added a `render.yaml` file to your project.
   - Make sure it's at the root of your repository or in the frontend directory.

2. **Update API URL**:
   - Edit the `REACT_APP_API_URL` in `render.yaml` to point to your actual backend URL.

3. **Deploy via Render Blueprint**:
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect to your repository
   - Render will use the render.yaml file to configure your services

## Troubleshooting Common Issues

### Build Failures

If your build fails, check the following:

1. **Dependencies Issues**:
   Run our dependency fix script locally first:
   ```
   node frontend/fix-dependencies.js
   ```

2. **Node Version**:
   Add an `.nvmrc` file in your frontend directory with:
   ```
   v16.20.0
   ```

3. **Build Timeout**:
   If you're still having timeout issues, try:
   - Pre-building assets locally: `npm run build`
   - Creating a "Web Service" instead with a custom Dockerfile

### Routing Issues

If you encounter 404 errors when navigating directly to routes:

1. Check that the rewrite rules are properly set in render.yaml
2. Verify that your React Router is set up correctly in your code

### API Connection Issues

1. Ensure your `REACT_APP_API_URL` environment variable is set correctly
2. Check CORS settings in your backend

## Custom Domain Setup

To add a custom domain:

1. Go to your Static Site in Render Dashboard
2. Click on "Settings" → "Custom Domain"
3. Add your domain and follow the DNS instructions

## Monitoring and Logs

To view build logs and monitor your site:

1. Go to your Static Site in Render Dashboard
2. Click on "Logs" to see build and deployment logs
3. "Events" tab shows deployment history

## Cost Considerations

- **Free Tier**: Render offers a free tier for static sites with limitations:
  - Limited bandwidth (100 GB/month)
  - Build minutes limitations
- **Paid Plans**: Consider upgrading for higher limits and better performance

## Switching from Vercel to Render

If you've already deployed to Vercel but want to switch:

1. Deploy to Render using steps above
2. Update any DNS records pointing to Vercel
3. Cancel your Vercel deployment if needed

## Continuous Deployment

Render automatically deploys when you push changes to your repository. To configure:

1. Go to your Static Site → "Settings" → "Build & Deploy"
2. Configure auto-deploy settings
3. Set up branch deploy rules if needed
