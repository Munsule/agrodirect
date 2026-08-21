import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  Firestore,
  Unsubscribe,
  query,
  orderBy
} from 'firebase/firestore';
import { Listing, User } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function initFirebase(): Firestore | null {
  if (db) return db;

  try {
    const config = {
      apiKey: firebaseConfigJson.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
      authDomain: firebaseConfigJson.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: firebaseConfigJson.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: firebaseConfigJson.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: firebaseConfigJson.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: firebaseConfigJson.appId || import.meta.env.VITE_FIREBASE_APP_ID,
    };

    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }

    // Initialize with Long-Polling enabled to guarantee stability in sandboxed container/iframe environments
    try {
      if (firebaseConfigJson.firestoreDatabaseId) {
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true,
          experimentalAutoDetectLongPolling: true,
        }, firebaseConfigJson.firestoreDatabaseId);
      } else {
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true,
          experimentalAutoDetectLongPolling: true,
        });
      }
    } catch {
      // If already initialized, get instance
      if (firebaseConfigJson.firestoreDatabaseId) {
        db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
      } else {
        db = getFirestore(app);
      }
    }

    return db;
  } catch (error) {
    console.warn('Firebase initialization notice (operating with local resilience):', error);
    return null;
  }
}

export const getDb = () => {
  if (!db) {
    return initFirebase();
  }
  return db;
};

// Real-time listener for listings
export function subscribeToListings(onUpdate: (listings: Listing[]) => void): Unsubscribe | null {
  const database = getDb();
  if (!database) return null;

  try {
    const listingsRef = collection(database, 'listings');
    return onSnapshot(listingsRef, (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const items: Listing[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Listing);
      });
      // Sort by createdAt descending
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    }, (error) => {
      console.warn('Firestore real-time subscription error:', error);
    });
  } catch (err) {
    console.warn('Could not establish Firestore subscription:', err);
    return null;
  }
}

// Real-time listener for users (farmers & buyers)
export function subscribeToUsers(onUpdate: (users: User[]) => void): Unsubscribe | null {
  const database = getDb();
  if (!database) return null;

  try {
    const usersRef = collection(database, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      if (snapshot.empty) {
        return;
      }
      const items: User[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as User);
      });
      onUpdate(items);
    }, (error) => {
      console.warn('Firestore users subscription error:', error);
    });
  } catch (err) {
    console.warn('Could not establish Firestore users subscription:', err);
    return null;
  }
}

// Seed Database if empty
export async function seedFirestoreDatabase(initialListings: Listing[], initialUsers: User[]): Promise<boolean> {
  const database = getDb();
  if (!database) return false;

  try {
    const listingsRef = collection(database, 'listings');
    const existingSnap = await getDocs(listingsRef);

    if (existingSnap.empty) {
      console.log('Seeding initial mock produce products into Firestore...');
      for (const item of initialListings) {
        await setDoc(doc(database, 'listings', item.id), item);
      }
      for (const u of initialUsers) {
        await setDoc(doc(database, 'users', u.id), u);
      }
      console.log('Firestore successfully seeded with mock produce batches.');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Firestore seeding check error:', error);
    return false;
  }
}

// Save single listing
export async function saveListingToFirestore(listing: Listing): Promise<void> {
  const database = getDb();
  if (!database) return;

  try {
    await setDoc(doc(database, 'listings', listing.id), listing, { merge: true });
  } catch (error) {
    console.warn('Firestore saveListing error:', error);
  }
}

// Delete single listing
export async function deleteListingFromFirestore(listingId: string): Promise<void> {
  const database = getDb();
  if (!database) return;

  try {
    await deleteDoc(doc(database, 'listings', listingId));
  } catch (error) {
    console.warn('Firestore deleteListing error:', error);
  }
}

// Update single listing
export async function updateListingInFirestore(listingId: string, updates: Partial<Listing>): Promise<void> {
  const database = getDb();
  if (!database) return;

  try {
    await updateDoc(doc(database, 'listings', listingId), updates);
  } catch (error) {
    console.warn('Firestore updateListing error:', error);
  }
}

// Save User Profile
export async function saveUserToFirestore(user: User): Promise<void> {
  const database = getDb();
  if (!database) return;

  try {
    await setDoc(doc(database, 'users', user.id), user, { merge: true });
  } catch (error) {
    console.warn('Firestore saveUser error:', error);
  }
}
