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
