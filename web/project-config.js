/**
 * @fileoverview Provides the project specific settings in one place.
 */

/**
 * messageModule is a module containing the variables and functions for the
 * Firebase message processing.
 */
// eslint-disable-next-line no-unused-vars
const messageModule = (function () {
  'use strict'

  // Firebase configuration. Copy this in from the web apps section of project
  // settings.
  const firebaseConfig = {
    /*
      COPY IN THE FIREBASE CONFIG
    */
  }

  // The web push certificate key (or vapid key) comes from the Cloud Messaging
  // tab in your Firebase project settings.
  const webPushCertificateKey = 'WEB PUSH KEY'

  // Provide the URL to the web page so we can change focus to it.
  const webSiteUrl = 'https://YOUR URL HERE'

  // Configuration for the IndexedDB used by the service worker.
  const dbName = 'push-notifications'
  const storeName = 'pending'
  const dbVersion = 1

  // Set up the Firebase app, messaging and communication channel.
  const firebaseApp = firebase.initializeApp(firebaseConfig)
  const firebaseMessaging = firebaseApp.messaging()
  const commChannel = new BroadcastChannel('messages')

  let serviceWorkerRegistration

  return {
    firebaseConfig: firebaseConfig,
    webPushCertificateKey: webPushCertificateKey,
    webSiteUrl: webSiteUrl,
    firebaseApp: firebaseApp,
    firebaseMessaging: firebaseMessaging,
    commChannel: commChannel,
    serviceWorkerRegistration: serviceWorkerRegistration,
    indexedDB: { name: dbName, store: storeName, version: dbVersion }
  }
})()
