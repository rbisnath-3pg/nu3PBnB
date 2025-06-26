require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE = 'https://nu3pbnb-api.onrender.com';

async function triggerBookingDiagnostics() {
  console.log('🔄 Triggering booking diagnostics in production...');
  
  try {
    // First, check if the diagnostics endpoint is working
    const diagRes = await fetch(`${API_BASE}/api/diagnostics/booking-tests`);
    if (diagRes.ok) {
      const currentDiag = await diagRes.json();
      console.log('📊 Current diagnostics:', JSON.stringify(currentDiag, null, 2));
    }
    
    // Now trigger the booking test by making a request to the health endpoint
    // This will trigger the startup tests which include the booking test
    console.log('🧪 Triggering startup tests...');
    const healthRes = await fetch(`${API_BASE}/api/health`);
    
    if (healthRes.ok) {
      console.log('✅ Health check successful');
      
      // Wait a moment for tests to complete
      console.log('⏳ Waiting for tests to complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check diagnostics again
      const newDiagRes = await fetch(`${API_BASE}/api/diagnostics/booking-tests`);
      if (newDiagRes.ok) {
        const newDiag = await newDiagRes.json();
        console.log('📊 Updated diagnostics:', JSON.stringify(newDiag, null, 2));
        
        if (newDiag.lastRun && newDiag.success) {
          console.log('✅ Booking diagnostics updated successfully!');
          console.log('📱 Refresh your frontend to see the updated diagnostics');
        } else {
          console.log('⚠️ Diagnostics not updated. You may need to run the script in Render shell.');
        }
      }
    } else {
      console.log('❌ Health check failed:', healthRes.status);
    }
    
  } catch (err) {
    console.error('❌ Error triggering diagnostics:', err.message);
    console.log('\n💡 You need to run the booking diagnostics script in your Render shell:');
    console.log('1. Go to your Render Dashboard');
    console.log('2. Select your nu3pbnb-api service');
    console.log('3. Click on the "Shell" tab');
    console.log('4. Run: node update-booking-diagnostics.js');
  }
}

triggerBookingDiagnostics().catch(console.error); 