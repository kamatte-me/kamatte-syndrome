import firebase from 'firebase/app';
require('firebase/messaging');

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.GCLOUD_PROJECT,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
  });
}

export default firebase;