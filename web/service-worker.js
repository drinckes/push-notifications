/**
 * @fileoverview This is the messaging service worker.
 */

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js')
importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/umd.js')
importScripts('project-config.js')
importScripts('init-firebase.js')

/**
 * onBackgroundMessage receives Firebase messages.
 * It saves them, displays a notification, and pokes the client to see if it is
 * able to receive messages.
 */
messageModule.firebaseMessaging.onBackgroundMessage((msg) => {
  console.log('service worker received firebase message', msg)
  // Decode the base64 encoded body.
  msg.data.body = atob(msg.data.body)
  saveMessage(msg)
  const title = msg.data.title
  const options = {
    body: msg.data.body,
    requireInteraction: true
  }
  self.registration.showNotification(title, options)
  // Check if the web page is present and can receive messages to display.
  messageModule.commChannel.postMessage({
    hello: 'check if the client is able to receive messages'
  })
})

/**
 * When the user clicks on a notification, we switch to our web page if it's
 * open, or open it in a new tab if it isn't.
 */
self.addEventListener('notificationclick', (event) => {
  console.log(event)
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clientList) => {
      console.log('got list', clientList)
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        console.log('got client', client)
        if (client.url === messageModule.webSiteUrl && 'focus' in client) {
          return client.focus()
        }
        console.log('client does not match', client)
      }
      if (clients.openWindow) {
        return clients.openWindow(messageModule.webSiteUrl)
      }
    })
  )
})

/**
 * getDB creates or upgrades the IndexedDB used to store messages and returns
 * the database handle.
 */
async function getDB () {
  const db = await idb.openDB(messageModule.indexedDB.name, messageModule.indexedDB.version, {
    upgrade (db, oldVersion) {
      console.log('creating or upgrading db')
      switch (oldVersion) {
        case 0:
          db.createObjectStore(messageModule.indexedDB.store, {
            keyPath: 'messageId'
          })
          break
      }
    }
  })
  return db
}

/**
 * saveMessage writes a Firebase message to the database.
 */
async function saveMessage (msg) {
  // Background messages don't have message IDs, so set one using the data
  // value.
  msg.messageId = msg.data.id
  const db = await getDB()
  db.add(messageModule.indexedDB.store, msg)
}

/**
 * When the service worker is activated, set up the database.
 */
self.addEventListener('activate', (event) => {
  getDB()
})

/**
 * onmessage is called when we receive a message from the client.
 * This is expected to be in response to our message, and signals that the
 * client is ready to receive our pending Firebase messages.
 * We just throw all the pending messages - we don't wait for acknowledgement
 * for each one.
 */
messageModule.commChannel.onmessage = async function (cmsg) {
  console.log('service worker received channel message', cmsg)
  // If the response includes the attribute 'ready', we can send our pending
  // messages.
  if ('ready' in cmsg.data) {
    const db = await getDB()
    const tx = db.transaction(messageModule.indexedDB.store, 'readwrite')
    const msgs = await tx.store.getAll()
    console.log('service worker has ' + msgs.length + ' pending messages')
    // Sort the messages by timestamp, so they don't arrive out of order.
    msgs.sort((a, b) => {
      return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0)
    })
    for (let i = 0; i < msgs.length; i++) {
      console.log('service worker broadcasting message', msgs[i])
      messageModule.commChannel.postMessage({ message: msgs[i] })
      console.log('service worker deleting message', msgs[i].messageId)
      await tx.store.delete(msgs[i].messageId)
    }
    await tx.done
  }
}
