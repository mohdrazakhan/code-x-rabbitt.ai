#!/usr/bin/env node

/**
 * Firebase Admin Setup Helper Script
 * 
 * Usage:
 *   1. Download your service account JSON from Firebase Console
 *   2. Run: node setup-firebase-admin.js path/to/your-service-account.json
 *   3. Copy the output to your .env.local file
 */

const fs = require('fs');
const path = require('path');

function setupFirebaseAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\n🔥 Firebase Admin Setup Helper\n');
    console.log('📋 Steps to configure Firebase Admin:\n');
    console.log('1️⃣  Go to Firebase Console:');
    console.log('   https://console.firebase.google.com/project/code-x-3acc0/settings/serviceaccounts/adminsdk\n');
    console.log('2️⃣  Click "Generate new private key" button\n');
    console.log('3️⃣  Download the JSON file\n');
    console.log('4️⃣  Run this script with the path to the downloaded file:');
    console.log('   node setup-firebase-admin.js ~/Downloads/code-x-3acc0-xxxxx.json\n');
    console.log('5️⃣  Copy the output and paste it into your .env.local file\n');
    console.log('6️⃣  Restart your Next.js server (npm run dev)\n');
    process.exit(0);
  }

  const jsonPath = args[0];
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Error: File not found:', jsonPath);
    console.log('\nPlease check the path and try again.');
    process.exit(1);
  }

  try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const serviceAccount = JSON.parse(jsonContent);

    // Validate required fields
    const required = ['project_id', 'private_key', 'client_email'];
    const missing = required.filter(field => !serviceAccount[field]);
    
    if (missing.length > 0) {
      console.error('❌ Error: Invalid service account JSON. Missing fields:', missing.join(', '));
      process.exit(1);
    }

    console.log('\n✅ Service account JSON is valid!\n');
    console.log('📝 Add these lines to your .env.local file:\n');
    console.log('─'.repeat(80));
    
    // Option 1: Individual fields (easier to read)
    console.log('\n# Option 1: Individual fields');
    console.log(`FIREBASE_PROJECT_ID="${serviceAccount.project_id}"`);
    console.log(`FIREBASE_CLIENT_EMAIL="${serviceAccount.client_email}"`);
    console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, '\\n')}"`);
    
    // Option 2: Base64 encoded JSON (cleaner)
    console.log('\n# Option 2: Base64 encoded (RECOMMENDED - just one line)');
    const encoded = Buffer.from(jsonContent).toString('base64');
    console.log(`FIREBASE_SERVICE_ACCOUNT_JSON="${encoded}"`);
    
    console.log('\n' + '─'.repeat(80));
    console.log('\n✨ Configuration ready! Next steps:\n');
    console.log('1. Open .env.local in your editor');
    console.log('2. Replace the existing Firebase Admin lines with one of the options above');
    console.log('   (Option 2 is recommended - it\'s cleaner)');
    console.log('3. Save the file');
    console.log('4. Restart your Next.js server (Ctrl+C then npm run dev)');
    console.log('5. Your leaderboard will now show real users! 🎉\n');

  } catch (error) {
    console.error('❌ Error processing file:', error.message);
    process.exit(1);
  }
}

setupFirebaseAdmin();
