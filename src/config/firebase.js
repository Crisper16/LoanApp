import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC0HUm2IXImdr0lRd2IR10Qs92vhGVPKhs",
  authDomain: "forrm-4187f.firebaseapp.com",
  databaseURL: "https://forrm-4187f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "forrm-4187f",
  storageBucket: "forrm-4187f.appspot.com",
  messagingSenderId: "152497812641",
  appId: "1:152497812641:web:49ed580a8d227f9c2f2ce0",
  measurementId: "G-E76MEDXZMR"
};

const app = initializeApp(firebaseConfig);

// Initialize auth only if it hasn't been initialized yet
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };