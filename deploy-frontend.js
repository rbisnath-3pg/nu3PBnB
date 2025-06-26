#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Frontend to Render...');
console.log('='.repeat(50));

async function deployFrontend() {
  try {
    // Step 1: Build the frontend
    console.log('📦 Building frontend...');
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend built successfully');

    // Step 2: Check if dist folder exists
    const distPath = path.join(__dirname, 'frontend', 'dist');
    if (!fs.existsSync(distPath)) {
      throw new Error('Dist folder not found after build');
    }

    // Step 3: Check if index.html exists
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error('index.html not found in dist folder');
    }

    console.log('✅ Build verification passed');

    // Step 4: Provide deployment instructions
    console.log('\n📋 Manual Deployment Instructions:');
    console.log('1. Go to https://dashboard.render.com');
    console.log('2. Click "New +" and select "Static Site"');
    console.log('3. Connect your GitHub repository: https://github.com/rbisnath-3pg/nu3PBnB');
    console.log('4. Configure the service:');
    console.log('   - Name: nu3pbnb-frontend');
    console.log('   - Build Command: cd frontend && npm install --legacy-peer-deps && npm run build');
    console.log('   - Publish Directory: frontend/dist');
    console.log('5. Add Environment Variable:');
    console.log('   - Key: VITE_API_URL');
    console.log('   - Value: https://nu3pbnb-api.onrender.com');
    console.log('6. Click "Create Static Site"');

    console.log('\n🔧 Alternative: Use the frontend/render.yaml file');
    console.log('1. Go to https://dashboard.render.com');
    console.log('2. Click "New +" and select "Blueprint"');
    console.log('3. Connect your GitHub repository');
    console.log('4. Select the frontend/render.yaml file');
    console.log('5. Click "Apply"');

    console.log('\n🌐 After deployment, your frontend will be available at:');
    console.log('https://nu3pbnb-frontend.onrender.com');

    console.log('\n✅ Deployment script completed!');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployFrontend(); 