/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBx5mIaHhqpyOhPqcM6fgq8Fv-Iet-0fck",
  authDomain: "stately-snowfall-rwjrd.firebaseapp.com",
  projectId: "stately-snowfall-rwjrd",
  storageBucket: "stately-snowfall-rwjrd.firebasestorage.app",
  messagingSenderId: "1065099533513",
  appId: "1:1065099533513:web:658762b647004fe9e48118"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if provided, otherwise default
const db = getFirestore(app, "ai-studio-symphonysimrsv20-b114ad60-842c-4b35-aeaf-1cdcdbe02177");

export { app, db };
