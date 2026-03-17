import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeG8mVk99-kEcG-E4oL2HsXyz-QILrLp8",
  authDomain: "internship-recommender12.firebaseapp.com",
  projectId: "internship-recommender12",
  storageBucket: "internship-recommender12.firebasestorage.app",
  messagingSenderId: "845692505798",
  appId: "1:845692505798:web:d44da0e6eff3219c5e91c7",
  measurementId: "G-Y2NZ83CJGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Handles Firebase Authentication (Login & Signup)
 */
export const simulateAuth = async (email, password, isLogin, name = "") => {
  try {
    if (isLogin) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store in localStorage for frontend session consistency
      const userData = { uid: user.uid, email: user.email, name: user.displayName || email.split('@')[0] };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      return userData;
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create a base profile document for the new user in Firestore
      const userData = { uid: user.uid, email: user.email, name: name || email.split('@')[0] };
      await setDoc(doc(db, "users", user.uid), userData);
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return userData;
    }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Firebase Auth Error: Email already in use.");
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error("Firebase Auth Error: Invalid email or password.");
    } else {
      throw new Error(`Firebase Auth Error: ${error.message}`);
    }
  }
};

/**
 * Saves completed profile to Firestore
 */
export const saveProfileToFirestore = async (uid, profileData) => {
  try {
    await setDoc(doc(db, "profiles", uid), profileData);
    return true;
  } catch (error) {
    console.error("Error saving profile to Firestore:", error);
    throw error;
  }
};

/**
 * Fetches user profile from Firestore
 */
export const getProfileFromFirestore = async (uid) => {
  try {
    const docRef = doc(db, "profiles", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile from Firestore:", error);
    throw error;
  }
};

/**
 * Logs out the user from Firebase and clears local session
 */
export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
