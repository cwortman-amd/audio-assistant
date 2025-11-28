#!/bin/bash

# Load .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set defaults if not set in .env
HOST=${HOST:-"localhost"}
PORT=${PORT:-"8000"}

URL="http://$HOST:$PORT/"

echo "Checking API service at $URL..."

# Check if the service is up
if curl -s --head --request GET "$URL" | grep "200 OK" > /dev/null; then
  echo "✅ Service is UP and functional."
  # Optional: Print the response body
  # curl -s "$URL"
else
  echo "❌ Service is DOWN or not reachable."
  exit 1
fi
