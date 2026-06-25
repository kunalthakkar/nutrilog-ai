import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { LogEntry } from "./types";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Collection reference
const LOGS_COLLECTION = "fitness_logs";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // Custom mobile login, no Firebase Auth user session
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Fetch all fitness logs for a specific mobile number from Firestore
 */
export async function getUserLogsFromFirestore(mobile: string): Promise<LogEntry[]> {
  try {
    const q = query(
      collection(db, LOGS_COLLECTION),
      where("userMobile", "==", mobile),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    const logs: LogEntry[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as LogEntry);
    });
    return logs;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, LOGS_COLLECTION);
    return [];
  }
}

/**
 * Save (or update) a single log entry to Firestore
 */
export async function saveLogToFirestore(log: LogEntry): Promise<void> {
  const path = `${LOGS_COLLECTION}/${log.id}`;
  try {
    const docRef = doc(db, LOGS_COLLECTION, log.id);
    await setDoc(docRef, log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a log entry from Firestore
 */
export async function deleteLogFromFirestore(logId: string): Promise<void> {
  const path = `${LOGS_COLLECTION}/${logId}`;
  try {
    const docRef = doc(db, LOGS_COLLECTION, logId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Sync local storage logs with Firestore
 * Uploads local logs that do not exist in Firestore, and returns the consolidated list.
 */
export async function syncLogsWithFirestore(mobile: string, localLogs: LogEntry[]): Promise<LogEntry[]> {
  try {
    const cloudLogs = await getUserLogsFromFirestore(mobile);
    const cloudIds = new Set(cloudLogs.map(l => l.id));
    
    // Find logs in local storage that aren't in Firestore yet
    const pendingUploads = localLogs.filter(l => !cloudIds.has(l.id));
    
    if (pendingUploads.length > 0) {
      console.log(`Syncing ${pendingUploads.length} local logs to Firestore...`);
      // Upload pending logs in parallel
      await Promise.all(pendingUploads.map(log => saveLogToFirestore(log)));
      
      // Fetch latest consolidated list
      return await getUserLogsFromFirestore(mobile);
    }
    
    return cloudLogs;
  } catch (error) {
    console.error("Error during log synchronization:", error);
    return localLogs; // Fallback to local logs on error
  }
}
