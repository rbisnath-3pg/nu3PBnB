# 🔧 Environment Variables Setup Guide

## 🚨 **IMPORTANT: Never commit real credentials to your code!**

Your database connection string should be set as an environment variable, not hardcoded in your application.

## 📋 **Required Environment Variables**

### **For Local Development (.env file):**
```bash
MONGODB_URI=mongodb+srv://rbisnath:<password>@cluster0.psisy90.mongodb.net/nu3pbnb?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development
PORT=3000
JWT_SECRET=your_local_jwt_secret
```

### **For Production (Render Dashboard):**
```bash
MONGODB_URI=mongodb+srv://rbisnath:<password>@cluster0.psisy90.mongodb.net/nu3pbnb?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
PORT=10000
JWT_SECRET=your_production_jwt_secret
```

## 🗄️ **MongoDB Atlas Setup**

1. **Go to [mongodb.com/atlas](https://mongodb.com/atlas)**
2. **Create a cluster, add a user, and allow access from anywhere**
3. **Copy your connection string from the Drivers > Node.js tab**
4. **Replace `<password>` with your actual password**

## 🔧 **Setting Up in Render**

1. **Go to your Render dashboard**
2. **Click on `nu3pbnb-api` service**
3. **Go to "Environment" tab**
4. **Add these variables:**

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_SECRET` | `nu3pbnb_jwt_secret_key_2024` |
| `MONGODB_URI` | `your_mongodb_connection_string` |

## 🔒 **Security Notes**

- ✅ **DO** set environment variables in Render dashboard
- ✅ **DO** use different JWT secrets for development and production
- ❌ **DON'T** commit real credentials to GitHub
- ❌ **DON'T** hardcode connection strings in your code

## 🚀 **After Setting Variables**

1. **Click "Manual Deploy"** in Render
2. **Choose "Deploy latest commit"**
3. **Wait for deployment to complete**
4. **Test your API endpoints**

## 📞 **Need Help?**

If you need assistance setting up your MongoDB Atlas connection string, let me know and I'll guide you through the process step-by-step!

### Troubleshooting
- If you see connection errors, double-check your URI and password
- For more, see `DEPLOYMENT.md` 