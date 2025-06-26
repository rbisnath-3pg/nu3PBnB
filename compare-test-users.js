const mongoose = require('mongoose');
const User = require('./models/User');

const TEST_USERS = [
  'admin_robbie@google.com',
  'host_davonte@hotmail.com',
  'host_georgette@hotmail.com',
  'host_josh@hotmail.com',
  'guest_patience@hotmail.com',
  'guest_rubie@gmail.com',
];

const LOCAL_URI = 'mongodb://localhost:27017/nu3pbnb';
const PROD_URI = process.env.MONGODB_URI;

if (!PROD_URI) {
  console.error('❌ Please set the MONGODB_URI environment variable to your production database URI.');
  process.exit(1);
}

async function fetchUsers(uri) {
  const conn = await mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const UserModel = conn.model('User', User.schema);
  const users = await UserModel.find({ email: { $in: TEST_USERS } }).lean();
  await conn.close();
  return users;
}

function userToKey(user) {
  // Only compare relevant fields
  return {
    email: user.email,
    role: user.role,
    name: user.name,
    onboardingCompleted: user.onboardingCompleted,
    onboarded: user.onboarded,
    themePreference: user.themePreference,
    language: user.language,
    bio: user.bio,
    location: user.location,
  };
}

function compareUsers(localUsers, prodUsers) {
  const report = [];
  for (const email of TEST_USERS) {
    const local = localUsers.find(u => u.email === email);
    const prod = prodUsers.find(u => u.email === email);
    if (!local && !prod) {
      report.push({ email, status: '❌ Missing in both' });
    } else if (!local) {
      report.push({ email, status: '❌ Missing in local', prod });
    } else if (!prod) {
      report.push({ email, status: '❌ Missing in prod', local });
    } else {
      const localKey = userToKey(local);
      const prodKey = userToKey(prod);
      const diffs = {};
      for (const key of Object.keys(localKey)) {
        if (localKey[key] !== prodKey[key]) {
          diffs[key] = { local: localKey[key], prod: prodKey[key] };
        }
      }
      if (Object.keys(diffs).length === 0) {
        report.push({ email, status: '✅ Match' });
      } else {
        report.push({ email, status: '⚠️ Difference', diffs });
      }
    }
  }
  return report;
}

(async () => {
  try {
    console.log('Fetching users from local...');
    const localUsers = await fetchUsers(LOCAL_URI);
    console.log('Fetching users from production...');
    const prodUsers = await fetchUsers(PROD_URI);
    console.log('\n=== USER COMPARISON REPORT ===');
    const report = compareUsers(localUsers, prodUsers);
    for (const entry of report) {
      if (entry.status === '✅ Match') {
        console.log(`✅ ${entry.email}: Match`);
      } else if (entry.status === '⚠️ Difference') {
        console.log(`⚠️  ${entry.email}: Differences:`);
        console.table(entry.diffs);
      } else {
        console.log(`${entry.status} ${entry.email}`);
      }
    }
    console.log('\nDone.');
  } catch (err) {
    console.error('❌ Error comparing users:', err);
  } finally {
    process.exit(0);
  }
})(); 