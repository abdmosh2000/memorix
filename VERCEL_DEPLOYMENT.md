# Vercel Deployment Guide for Memorix Frontend

This guide provides specific instructions for deploying the Memorix frontend on Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account (can use GitHub login)
- Your project code pushed to GitHub

## Deployment Steps

### 1. Connect to GitHub Repository

- Log in to your Vercel account
- Click "Add New" → "Project"
- Import your GitHub repository
- Select the repository containing your Memorix project

### 2. Configure Project Settings

When configuring the project, use the following settings:

- **Framework Preset**: Other
- **Root Directory**: `frontend/` (if your repository contains both frontend and backend)
- **Build Command**: The vercel.json file will handle this
- **Output Directory**: `dist` (vercel.json handles this)

### 3. Environment Variables

Add the following environment variables:

- `REACT_APP_API_URL`: Set to your backend API URL (e.g., `https://api.yourdomain.com/api`)

### 4. Deploy

- Click "Deploy"
- Vercel will use the configuration in `vercel.json` to deploy your application

## Troubleshooting

If you encounter deployment issues, check the following:

### Build Failure: Command "npm run build" exited with 126

This is often a permissions issue. Try the following fixes:

1. Make sure all build scripts have the proper permissions
```bash
git update-index --chmod=+x vercel-build.js
```

2. Verify your Node.js version
   - Vercel uses Node.js 14 by default
   - Our project requires Node.js 14 or higher (as specified in package.json)
   - You can specify a different version in the Vercel project settings

3. Check build logs for specific errors
   - Go to Deployments → [your deployment] → Build Logs

### Missing CSS or Assets

If your styles or assets are missing:

1. Verify that webpack is correctly configured to handle CSS and assets
2. Check that the output directory in webpack.config.js matches the output directory in vercel.json

### API Connection Issues

If your frontend can't connect to the backend:

1. Verify the `REACT_APP_API_URL` environment variable is correctly set
2. Check CORS configuration in backend/app.js
3. Ensure your API is deployed and accessible

## Custom Domain Setup

To set up a custom domain:

1. Go to your Vercel project settings → Domains
2. Add your domain name
3. Follow Vercel's DNS configuration instructions
