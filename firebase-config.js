/* =============================================
   FIREBASE CONFIG — paste your own project values here
   Get these from: Firebase Console → Project Settings → General
   → "Your apps" → Web app → SDK setup and configuration
   ============================================= */
const firebaseConfig = {
  apiKey:            "AIzaSyBBDNtoRpXfnzjRKAsfWJoYMRjlznyjJe8",
  authDomain:        "professionaldrivinginstr-bbb5f.firebaseapp.com",
  projectId:         "professionaldrivinginstr-bbb5f",
  storageBucket:     "professionaldrivinginstr-bbb5f.firebasestorage.app",
  messagingSenderId: "955909566061",
  appId:             "1:955909566061:web:ab9f1de1c142f95fe61964",
  measurementId:     "G-5971WNRQWY"
};

firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();

/* NOTE ON SECURITY:
   This apiKey is meant to be public — Firebase is designed for it to live in
   client-side code. The real protection comes from:
     1) Firestore Security Rules (see firestore.rules.txt) — these run on
        Google's servers and decide who can read/write what, regardless of
        what the JS code says.
     2) Firebase Authentication — the admin page now requires a real sign-in
        (email + password you create in the Firebase console), not a string
        compared in JS.
*/