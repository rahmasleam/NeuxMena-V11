import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB-xKNU2UpXZ4NPSTp1JDSeVMNONtc4fPg",
  authDomain: "techhub-eab11.firebaseapp.com",
  projectId: "techhub-eab11",
  storageBucket: "techhub-eab11.firebasestorage.app",
  messagingSenderId: "552476017706",
  appId: "1:552476017706:web:543ade3b558fc35f242f53",
  measurementId: "G-QEKFPN1FXY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;