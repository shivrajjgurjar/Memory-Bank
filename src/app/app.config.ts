import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjuP1dTxkNXUs_AQlJYJ7YeuUdjGVeFuY",
  authDomain: "memory-bank-96f43.firebaseapp.com",
  projectId: "memory-bank-96f43",
  storageBucket: "memory-bank-96f43.firebasestorage.app",
  messagingSenderId: "761291096058",
  appId: "1:761291096058:web:eaa05f7a895c42b4522e43",
  measurementId: "G-Z4ZG5LY2V1"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};

