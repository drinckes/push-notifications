# Push Messages To Browser Notifications

This repository provides a linux command that uses
[Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) to
forward a message to a browser and generate a browser notification.

This can be used when working on a terminal window running commands, to find out
when those commands have completed.

## Usage

Send the default message:

```sh
./sendmsg.sh
```

Change the title and body:

```sh
./sendmsg.sh -b "new notification body" everything left over is the title
```

Run in a pipeline, sending a message after the previous command completes with
the last 2.5k of the output:

```sh
find / --name core | sendmsg.sh -t
```

Or the first 2.5k of the output:

```sh
find / --name core | sendmsg.sh -h
```

If the message token changes:

```sh
./sendmsg.sh -t <MESSAGE TOKEN> Updating message token
```

## Configuring

1. Go to [firebase.google.com](https://firebase.google.com) and create a project.
1. Open the Firebase project settings (gear icon at top left).
1. Switch to the *Cloud Messaging* tab and copy the server key to a text
   editor, you'll need it when you first run the `sendmsg.sh` script.
1. In the *Web configuration panel*, highlight *Web Push certificates* and
   press *Generate key pair*. Copy this into `web/project-config.js` as
   `webPushCertificateKey`.
1. Switch to the *General* tab and add a web app. (If you don't have an HTTPS
   site to host your files on, set up Firebase hosting.)
1. Copy the Firebase configuration (starting with `const firebaseConfig`) to
   `web/project-config.js`.
1. Update `web/project-config.js` with the full URL to the file
   `messaging.html`.
1. Upload the files in `web` to your HTTP server or deploy them to Firebase
   hosting.
1. Open `messaging.html` in a browser. It should ask your permission to show
   notifications (grant it), and then display a message token.

Run:

```sh
./sendmsg.sh -s <SERVER KEY> -t <MESSAGE TOKEN> Setting key and token
```

You should get a browser notification!
