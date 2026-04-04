import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQ0CMclKv0MFqPMW6ipTmrnT4afrKDoME",
  authDomain: "collectors-platform.firebaseapp.com",
  projectId: "collectors-platform",
  storageBucket: "collectors-platform.firebasestorage.app",
  messagingSenderId: "1014387139092",
  appId: "1:1014387139092:web:7e6b859a483c7054cdbd01",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);