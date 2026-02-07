# Deployment Guide - Vercel

## Step 1: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit - TradeX platform"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `tradin` (or your preferred name)
3. Don't initialize with README, .gitignore, or license
4. Copy the repository URL

## Step 3: Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tradin.git
git push -u origin main
```

## Step 4: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Import the `tradin` repository
5. Click **"Import"**

### Configure Environment Variables

In Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=https://eqqcuapjbcbgzrxepoat.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
```

6. Click **"Deploy"**

## Step 5: Verify Deployment

Your app will be live at: `https://tradin.vercel.app`

### Features That Work:
- ✅ User Sign Up / Sign In
- ✅ Authentication with Supabase
- ✅ Dashboard Navigation
- ✅ Admin Dashboard
- ✅ Deposits/Withdrawals (Database stored)
- ✅ Real-time Profile Updates

### What's Disabled for Now:
- Withdrawal Modal (service refactoring needed)
- Complete withdrawal flow

## Continuous Deployment

Every time you push to `main` branch, Vercel automatically deploys:

```bash
git add .
git commit -m "Your changes"
git push
```

Your new version will be live in ~2-3 minutes!

---

**Your app is now production-ready and deployed on Vercel! 🎉**
