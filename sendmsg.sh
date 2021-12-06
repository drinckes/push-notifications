#!/bin/bash
# Send a message to firebase using cloud messaging.
# Usage:
#   Send a message with default title and body to Firebase:
#     ./sendmsg.sh
#   Send a message with the specified title to Firebase.
#     sendmsg.sh [title]

# Set the default body
body=$(echo "You have been notified"|base64)
body_overridden=0

message_token=""
server_key=""

# Override the body depending on the passed flags.
while getopts :m:s:b:ht opt; do
  case $opt in
    m)
      message_token="${OPTARG}"
      echo "${OPTARG}" > ~/.sendmsg-message-token
      ;;
    s)
      server_key="${OPTARG}"
      echo "${OPTARG}" > ~/.sendmsg-server-key
      ;;
    b)
      if ((body_overridden)); then
        echo "body was already overridden, skipping -b flag"
        continue
      fi
      echo "overriding notification body"
      body=$(echo "${OPTARG}"|base64)
      body_overridden=1
      ;;
    h)
      if ((body_overridden)); then
        echo "body was already overridden, skipping -h flag"
        continue
      fi
      if [[ -t 0 ]]; then
        echo "option -h is not valid in an interactive shell"
        exit 1
      fi
      echo "reading body from stdin"
      body=$(head -c 2560|base64)
      body_overridden=1
      ;;
    t)
      if ((body_overridden)); then
        echo "body was already overridden, skipping -t flag"
        continue
      fi
      if [[ -t 0 ]]; then
        echo "option -t is not valid in an interactive shell"
        exit 1
      fi
      echo "reading body from stdin"
      body=$(tail -c 2560|base64)
      body_overridden=1
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

# Get rid of the processed options and arguments.
shift $((OPTIND - 1))
# Set the title.
title="Boop"
if [[ -n "$*" ]]; then
  title="$*"
fi

# If we didn't set the server key and message token with arguments, read them
# from the config files.
if [[ -z "${server_key}" ]]; then
  if [[ ! -f ~/.sendmsg-server-key ]]; then
    echo "No server key - configure one with the -s argument"
    exit 1
  fi
  server_key=$(cat ~/.sendmsg-server-key)
fi
if [[ -z "${message_token}" ]]; then
  if [[ ! -f ~/.sendmsg-message-token ]]; then
    echo "No message token - configure one with the -m argument"
    exit 1
  fi
  message_token=$(cat ~/.sendmsg-message-token)
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
        \"body\":         \"${body}\",
        \"id\":           \"${id}\",
        \"timestamp\":    \"${timestamp}\",
        \"time_to_live\": \"86400\",
      },
      \"to\": \"${message_token}\"
    }" \
  https://fcm.googleapis.com/fcm/send)
echo "${resp}"
