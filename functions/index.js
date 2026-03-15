/**
 * Firebase Cloud Functions
 * As requested by the architecture spec, this serverless backend handles 
 * profile validation and background processing.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Triggered automatically when a new user signs up via Firebase Auth.
 * Prepares an empty document in Firestore.
 */
exports.createProfileDocument = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection("profiles").doc(user.uid).set({
    email: user.email,
    uid: user.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    academic: {},
    skills: [],
    preferences: {}
  });
});

/**
 * HTTP Callable Function: Generate AI Feedback safely on the server
 * This prevents exposing any NLP logic or logic bypasses on the client.
 */
exports.generateFeedbackModule = functions.https.onCall(async (data, context) => {
  // Authentication Guard
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated students can access the AI Feedback module."
    );
  }

  const { studentSkills, internshipId } = data;
  
  // 1. Fetch Internship requirements securely from DB
  const internshipDoc = await admin.firestore().collection("internships").doc(internshipId).get();
  if(!internshipDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Internship not found.");
  }
  
  const requiredSkills = internshipDoc.data().requiredSkills || [];

  // 2. Compute Differences Server-Side
  const studentSet = new Set(studentSkills.map(s => s.toLowerCase().trim()));
  const missingSkills = [];
  
  requiredSkills.forEach(req => {
    if(!studentSet.has(req.toLowerCase().trim())) {
      missingSkills.push(req);
    }
  });

  // 3. Return payload to client
  return {
    missing: missingSkills,
    message: missingSkills.length === 0 
      ? "Perfect Match!" 
      : `Missing skills: ${missingSkills.join(', ')}. Please upskill in these areas.`
  };
});
