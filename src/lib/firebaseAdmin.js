import { initializeApp, getApps, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccountFromEnv() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      // Support base64 or raw JSON
      const decoded = json.trim().startsWith('{') ? json : Buffer.from(json, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
    }
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) {
    return { project_id: projectId, client_email: clientEmail, private_key: privateKey };
  }
  return null;
}

export function getAdminApp() {
  if (!getApps().length) {
    const svc = getServiceAccountFromEnv();
    if (svc) {
      initializeApp({ credential: cert({ projectId: svc.project_id, clientEmail: svc.client_email, privateKey: svc.private_key }) });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  }
  return getApps()[0];
}

export function getAdminDb() {
  const app = getAdminApp();
  return getFirestore(app);
}
