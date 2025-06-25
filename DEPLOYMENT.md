# 🚀 Free Cloud Deployment Guide for nu3PBnB

## Quick Deploy Options

### 1. **Render** (Recommended - Easiest)
**Deploy Time**: ~10 minutes

#### Steps:
1. **Sign up** at [render.com](https://render.com)
2. **Connect your GitHub** repository
3. **Create a new Web Service**:
   - Choose your `nu3PBnB` repository
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`
   - Set **Environment Variables**:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     PORT=10000
     ```
4. **Deploy** and get your live URL!

#### Alternative: Use render.yaml (Auto-deploy)
1. Push the `render.yaml` file to your repo
2. Render will automatically detect and deploy both frontend and backend

---

### 2. **Railway** (Fast & Reliable)
**Deploy Time**: ~5 minutes

#### Steps:
1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** and select your repo
3. **Add MongoDB** from Railway's database options
4. **Set environment variables**:
   ```
   MONGODB_URI=railway_mongodb_url
   NODE_ENV=production
   JWT_SECRET=your_secret
   ```
5. **Deploy** - Railway auto-detects Node.js apps!

---

### 3. **Vercel + MongoDB Atlas** (Separate Frontend/Backend)
**Deploy Time**: ~15 minutes

#### Frontend (Vercel):
1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import** your repository
3. **Set build settings**:
   - Framework Preset: `Vite`
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
4. **Set environment variable**:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

#### Backend (Vercel):
1. Create `api/` folder in your root
2. Move your Express app to `api/index.js`
3. Deploy to Vercel as a serverless function

#### Database (MongoDB Atlas):
1. **Sign up** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create free cluster** (512MB)
3. **Get connection string** and add to your backend

---

### 4. **Netlify + Backend** (Static Frontend)
**Deploy Time**: ~10 minutes

#### Frontend (Netlify):
1. **Sign up** at [netlify.com](https://netlify.com)
2. **Connect GitHub** and select your repo
3. **Set build settings**:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
4. **Deploy** and get your frontend URL

#### Backend Options:
- **Railway** (recommended)
- **Render**
- **Heroku** (Eco dyno - $5/month)

---

## 🗄️ Database Setup

### MongoDB Atlas (Free Tier)
1. **Create account** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create cluster** (M0 - Free)
3. **Set up database access** (username/password)
4. **Set up network access** (0.0.0.0/0 for all IPs)
5. **Get connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nu3pbnb?retryWrites=true&w=majority
   ```

### Alternative: Railway MongoDB
- Railway provides MongoDB databases
- Automatic connection string generation
- No setup required

---

## 🔧 Environment Variables

### Required Variables:
```bash
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=10000
```

### Optional Variables:
```bash
LOG_LEVEL=info
API_RATE_LIMIT=1000
ENABLE_VERBOSE_LOGGING=false
```

---

## 📱 Frontend Configuration

### Update API URL:
In your frontend code, make sure API calls use the environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### Build Optimization:
The Vite config is already optimized for production builds.

---

## 🚨 Common Issues & Solutions

### 1. **CORS Errors**
- Update CORS configuration in `index.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:5173'],
  credentials: true
}));
```

### 2. **MongoDB Connection Issues**
- Check your connection string format
- Ensure network access is configured
- Verify username/password

### 3. **Build Failures**
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Review build logs for specific errors

### 4. **Environment Variables**
- Double-check variable names
- Ensure no spaces around `=` in variable definitions
- Restart service after adding new variables

---

## 🎯 Recommended Deployment Strategy

### For Beginners:
1. **Start with Render** - easiest full-stack deployment
2. **Use MongoDB Atlas** for database
3. **Follow the render.yaml approach**

### For Advanced Users:
1. **Frontend**: Vercel or Netlify
2. **Backend**: Railway or Render
3. **Database**: MongoDB Atlas or Railway MongoDB

---

## 📊 Cost Comparison (Free Tiers)

| Platform | Backend | Frontend | Database | Limitations |
|----------|---------|----------|----------|-------------|
| **Render** | ✅ 750h/month | ✅ Static hosting | ✅ MongoDB | Sleeps after 15min |
| **Railway** | ✅ $5 credit | ✅ Static hosting | ✅ MongoDB | 500 hours/month |
| **Vercel** | ✅ Serverless | ✅ Static hosting | ❌ External needed | 100GB bandwidth |
| **Netlify** | ❌ External needed | ✅ Static hosting | ❌ External needed | 100GB bandwidth |
| **Heroku** | ❌ Paid only | ❌ Paid only | ❌ External needed | No free tier |

---

## 🎉 Success Checklist

- [ ] Backend API is running and responding
- [ ] Frontend is accessible and loads
- [ ] Database connection is working
- [ ] User registration/login works
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] SSL certificate is active
- [ ] Custom domain is configured (optional)

---

## 🆘 Need Help?

1. **Check deployment logs** for specific errors
2. **Verify environment variables** are correctly set
3. **Test locally** with production environment variables
4. **Review platform documentation** for specific issues

**Happy Deploying! 🚀**

## 1. MongoDB Atlas Setup
- Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
- Add a database user (e.g., `rbisnath`) and set a password
- Allow access from anywhere (0.0.0.0/0) in Network Access
- Get your connection string (Drivers > Node.js)
- Example:
  ```
  mongodb+srv://rbisnath:<password>@cluster0.psisy90.mongodb.net/nu3pbnb?retryWrites=true&w=majority&appName=Cluster0
  ```

## 2. Render Deployment
- Push your code to GitHub
- Connect your repo to Render
- Use the `render.yaml` blueprint
- Set environment variables in the Render dashboard:
  - `MONGODB_URI` (your Atlas connection string)
  - `NODE_ENV=production`
  - `PORT=10000`
  - `JWT_SECRET=your_secret_key`
- Deploy and monitor logs for errors

## 3. Seeding Data
- Run `node seed-listings.js` to populate sample listings
- Script uses GeoJSON for location (required by backend)

## 4. Testing
- Run `npm test` for full test suite
- Some admin tests may fail if `adminToken` is not set up (see test file for details)
- For Mongoose/Jest integration, see [Mongoose Jest Docs](https://mongoosejs.com/docs/jest.html)

## 5. Troubleshooting
- If you see `Internal server error` on API endpoints, check your MongoDB URI and credentials
- For dependency issues, use `--legacy-peer-deps` in frontend build command (see `render.yaml`)
- For more, see `ENVIRONMENT_SETUP.md` and `API_DOCUMENTATION.md`

# Deployment Information

## Last Deployment
- **Date**: 2025-06-25 22:40:00 UTC
- **Status**: Ready for deployment
- **Build**: Frontend build successful (3.42s)
- **Tests**: All Jest tests passing

## Deployment Configuration
- **Backend**: Node.js API on Render
- **Frontend**: Static site on Render
- **Database**: MongoDB on Render

## Recent Fixes
- ✅ Fixed Jest configuration and Babel plugins
- ✅ Removed non-existent npm dependencies
- ✅ All tests passing (95 tests, 0 failures)
- ✅ Resolved import.meta syntax issues
- ✅ Added TextEncoder polyfills

## Build Commands
- Frontend: `cd frontend && npm install --legacy-peer-deps && npm run build`
- Backend: `npm install && npm start` 