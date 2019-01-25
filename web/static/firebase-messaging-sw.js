// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  messagingSenderId: '700466582811'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
  const notification = payload.notification;
  const title = notification.title || 'kamatte syndrome';
  const options = {
    body: notification.body || '何かしらアップデートしますた。',
    icon: notification.icon || '/logo.png',
  };
  self.registration.showNotification(title, options);

  self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = notification.click_action;
    event.waitUntil(self.clients.openWindow(url));
  });
});
