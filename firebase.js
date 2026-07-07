/* ============================================
   FIREBASE CONFIG - CartoonLK
   ============================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCHOWw4HtpaXWV9XLzcv62spLM9x9D1aXA",
  authDomain: "cartoonlk.firebaseapp.com",
  projectId: "cartoonlk",
  storageBucket: "cartoonlk.firebasestorage.app",
  messagingSenderId: "567630493008",
  appId: "1:567630493008:web:806794224c7a9a51976855",
  measurementId: "G-WR5RQFNYT5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Optional: Enable analytics
if (typeof firebase.analytics !== 'undefined') {
  const analytics = firebase.analytics();
}