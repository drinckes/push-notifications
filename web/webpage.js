/**
 * @fileoverview Code for the messaging web page.
 */

/**
 * Set up Firebase messaging in the web page.
 * This registers the service worker and obtains the messaging token.
 */
navigator.serviceWorker.register('./service-worker.js').then((registration) => {
  messageModule.serviceWorkerRegistration = registration
  messageModule.firebaseMessaging.useServiceWorker(registration)
  messageModule.firebaseMessaging.usePublicVapidKey(messageModule.webPushCertificateKey)
  messageModule.firebaseMessaging.getToken().then((tok) => {
    if (tok) {
      document.querySelector('#token').textContent = tok
      console.log('got token', tok)
    } else {
      console.error('No token for you. :-(')
    }
  }).catch((err) => {
    console.error('An error occurred while retrieving token. ', err)
  })
})

/**
 * onMessage receives the messages from Firebase, but only when this page is
 * the currently open and active tab.
 */
messageModule.firebaseMessaging.onMessage((msg) => {
  console.log('web page received foreground firebase message', msg)
  // Decode the base64 encoded body.
  msg.data.body = atob(msg.data.body)
  displayMessage(msg)
  const title = msg.data.title
  const options = {
    body: msg.data.body,
    requireInteraction: true
  }
  messageModule.serviceWorkerRegistration.showNotification(title, options)
})

/**
 * displayMessage adds the message to the web page.
 */
function displayMessage (msg) {
  const mdiv = document.createElement('div')
  mdiv.classList = 'message-container'
  const title = document.createElement('h2')
  title.classList = 'message-title'
  title.textContent = msg.data.title
  const body = document.createElement('pre')
  body.classList = 'message-body'
  body.textContent = msg.data.body
  const note = document.createElement('div')
  note.classList = 'message-metadata'
  const d = new Date(msg.data.timestamp * 1000)
  note.textContent = 'Created at ' + d.toISOString()
  mdiv.appendChild(title)
  mdiv.appendChild(body)
  mdiv.appendChild(note)
  const outer = document.createElement('div')
  outer.classList = 'outer-message-container'
  outer.appendChild(mdiv)
  document.querySelector('#messages').prepend(outer)
}

/**
 * When the channel receives a message, it can either be the service worker
 * checking to see if the web page is ready to receive messages, or a message
 * from the service worker.
 */
messageModule.commChannel.onmessage = async function (cmsg) {
  console.log('web page received channel message', cmsg)
  if ('hello' in cmsg.data) {
    // The service worker is checking to see if we can receive messages.
    messageModule.commChannel.postMessage({ ready: 'web page is ready for messages' })
  } else if ('message' in cmsg.data) {
    // We have a message from the service worker.
    displayMessage(cmsg.data.message)
  }
}

/**
 * Advertise that we're loaded and can receive any Firebase messages that the
 * service worker received during our absence.
 */
window.addEventListener('load', () => {
  setTimeout(() => {
    messageModule.commChannel.postMessage({ ready: 'web page is loaded and ready' })
  }, 2000)
})
