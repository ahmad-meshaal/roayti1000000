import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  databaseId: (firebaseConfig as any).firestoreDatabaseId || '(default)',
});

export const auth = getAuth(app);
export const storage = getStorage(app);

(storage as any).maxRetryTime = 60000;
(storage as any).maxOperationRetryTime = 120000;
