import {initializeApp,type FirebaseApp} from "firebase/app";
import {connectAuthEmulator,getAuth,onAuthStateChanged,signInAnonymously,type Auth,type User} from "firebase/auth";
import {connectFunctionsEmulator,getFunctions,type Functions} from "firebase/functions";

const firebaseConfig={
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured=Object.values(firebaseConfig).every(Boolean);
let bundle:{app:FirebaseApp;auth:Auth;functions:Functions}|null=null;
let userPromise:Promise<User>|null=null;

export function getFirebaseBundle(){
  if(!firebaseConfigured)throw new Error("Konfigurasi Firebase belum tersedia. Gunakan mode demo atau isi .env.");
  if(bundle)return bundle;
  const app=initializeApp(firebaseConfig);
  const auth=getAuth(app);
  const functions=getFunctions(app,import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION||"asia-southeast2");
  if(import.meta.env.VITE_USE_FIREBASE_EMULATORS==="true"){
    connectAuthEmulator(auth,"http://127.0.0.1:9099",{disableWarnings:true});
    connectFunctionsEmulator(functions,"127.0.0.1",5001);
  }
  bundle={app,auth,functions};return bundle;
}

export async function ensureAnonymousUser(){
  if(userPromise)return userPromise;
  const {auth}=getFirebaseBundle();
  userPromise=new Promise<User>((resolve,reject)=>{
    const unsubscribe=onAuthStateChanged(auth,user=>{if(user){unsubscribe();resolve(user);}},reject);
    if(!auth.currentUser)void signInAnonymously(auth).catch(error=>{unsubscribe();reject(error);});
  });
  return userPromise;
}
