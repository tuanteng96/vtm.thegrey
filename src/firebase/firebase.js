import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCFs7sk29IQjUouLTlKXbO7hXnT7HE2R2M",
    authDomain: "vienthammythegrey-1eb1e.firebaseapp.com",
    projectId: "vienthammythegrey-1eb1e",
    storageBucket: "vienthammythegrey-1eb1e.appspot.com",
    messagingSenderId: "149795494520",
    appId: "1:149795494520:web:5b57d94f5a6207c279ab8d",
    measurementId: "G-6DJ70620ZZ"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
export { auth, database };