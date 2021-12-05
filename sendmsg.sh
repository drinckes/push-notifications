#!/bin/bash
# Send a message to firebase using cloud messaging.
# Usage:
#   Send a message with default title and body to Firebase:
#     ./sendmsg.sh
#   Send a message with the specified title to Firebase.
#     sendmsg.sh [title]

# Get the server key from project settings of your Firebase project.
server_key="<SERVER KEY>"
# Get the message token from the web page.
message_token="<MESSAGE TOKEN>"

# Override the title.
title="Boop"
if [[ ! -z "$1" ]]; then
  title="$1"
fi

# Generate a message id using uuidgen or fallback to the time
id=$(uuidgen || date +%s.%N)
timestamp=$(date +%s)

resp=$(curl -s -X POST \
  -H "Authorization: key=${server_key}" \
  -H "Content-Type: application/json" \
  -d "{
      \"data\": {
        \"title\":        \"${title}\",
        \"body\":         \"You have been notified\",
        \"id\":           \"${id}\",
        \"timestamp\":    \"${timestamp}\",
        \"time_to_live\": \"86400\",
      },
      \"to\": \"${message_token}\"
    }" \
  https://fcm.googleapis.com/fcm/send)
echo "${resp}"
