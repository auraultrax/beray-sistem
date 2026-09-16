import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
const firebaseConfig={apiKey:"AIzaSyAnmGzhkJEfxKNcvLDRilXP-iQc3lMMLrc",authDomain:"sisteym-14312.firebaseapp.com",projectId:"sisteym-14312",storageBucket:"sisteym-14312.firebasestorage.app",messagingSenderId:"498532288088",appId:"1:498532288088:web:8d47ef5533f4c9ac946c2d"};
const app=initializeApp(firebaseConfig);
export const db=getFirestore(app);