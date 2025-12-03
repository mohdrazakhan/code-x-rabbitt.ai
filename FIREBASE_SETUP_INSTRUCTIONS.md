# Firebase Admin Setup Instructions

## Step 1: Get Service Account Key from Firebase Console

1. Go to: https://console.firebase.google.com/project/code-x-3acc0/settings/serviceaccounts/adminsdk

2. Click on "Generate new private key" button

3. A JSON file will be downloaded (something like `code-x-3acc0-firebase-adminsdk-xxxxx.json`)

## Step 2: Extract the values from the JSON file

The downloaded JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "code-x-3acc0",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@code-x-3acc0.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Step 3: Update .env.local

You have TWO options:

### Option A: Use the entire JSON (RECOMMENDED - Easier)
```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"code-x-3acc0",...}'
```

### Option B: Use individual fields
```bash
FIREBASE_PROJECT_ID="code-x-3acc0"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@code-x-3acc0.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Step 4: Restart your Next.js server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## Quick Script to Add Credentials

After downloading the JSON file, run this command:

```bash
# Replace 'path/to/your-service-account.json' with actual path
node -e "const fs=require('fs'); const json=fs.readFileSync('path/to/your-service-account.json','utf8'); const encoded=Buffer.from(json).toString('base64'); console.log('Add this to .env.local:\n\nFIREBASE_SERVICE_ACCOUNT_JSON='+encoded);"
```

This will give you a base64-encoded version to paste directly into .env.local!
