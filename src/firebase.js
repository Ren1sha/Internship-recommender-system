/**
 * Simulated Firebase Backend
 * To make this application instantly playable without requiring actual Firebase API keys,
 * this module simulates Firebase Auth and Firestore using localStorage.
 * 
 * In a real production scenario, these functions would use:
 * import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
 * import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
 */

// Generate a random UID similar to Firebase Auth
const generateUID = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Simulates Firebase Authentication
 */
export const simulateAuth = (email, password, isLogin, name = "") => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usersDB = JSON.parse(localStorage.getItem('mockUsersDB') || '{}');
      
      if (isLogin) {
        // Handle Login
        const user = Object.values(usersDB).find(u => u.email === email && u.password === password);
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, email: user.email, name: user.name || email.split('@')[0] }));
          resolve(user);
        } else {
          reject(new Error("Firebase Auth Error: Invalid email or password."));
        }
      } else {
        // Handle Signup
        const existingUser = Object.values(usersDB).find(u => u.email === email);
        if (existingUser) {
          reject(new Error("Firebase Auth Error: Email already in use."));
        } else {
          const newUser = { uid: generateUID(), email, password, name };
          usersDB[newUser.uid] = newUser;
          localStorage.setItem('mockUsersDB', JSON.stringify(usersDB));
          localStorage.setItem('currentUser', JSON.stringify({ uid: newUser.uid, email: newUser.email, name: newUser.name }));
          resolve(newUser);
        }
      }
    }, 800); // Simulate network delay
  });
};

/**
 * Simulates saving document to Firestore
 */
export const saveProfileToFirestore = (uid, profileData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(`profile_${uid}`, JSON.stringify(profileData));
      resolve(true);
    }, 600);
  });
};

/**
 * Simulates fetching document from Firestore
 */
export const getProfileFromFirestore = (uid) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem(`profile_${uid}`);
      resolve(data ? JSON.parse(data) : null);
    }, 300);
  });
};

/**
 * Simulates Logging Out
 */
export const logout = () => {
  localStorage.removeItem('currentUser');
  window.location.href = '/';
};
