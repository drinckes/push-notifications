/**
 * @fileoverview Script to initialise the firebase app and messaging.
 */

// Initialize Firebase and messaging.
const app = firebase.initializeApp(firebaseConfig);
const messaging = app.messaging();

// channel is used to communicate between the service worker and the web page.
// When the service worker receives a message from Firebase, it broadcasts an
// object with the attribute 'hello'.
// When the web page receives an object with 'hello', it broadcasts an object
// with 'ready'.
// When the service worker receives an object with 'ready', it sends each
// Firebase message, in an object with the attribute 'message'.
const channel = new BroadcastChannel('messages');
