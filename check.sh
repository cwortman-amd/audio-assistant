#!/bin/bash

# Defaults
BACKEND_HOST=${BACKEND_HOST:-"localhost"}
BACKEND_PORT=${BACKEND_PORT:-"8000"}
FRONTEND_HOST=${FRONTEND_HOST:-"localhost"}
FRONTEND_PORT=${FRONTEND_PORT:-"5173"}

BACKEND_URL="http://$BACKEND_HOST:$BACKEND_PORT/"
FRONTEND_URL="http://$FRONTEND_HOST:$FRONTEND_PORT/"

echo "========================================"
echo "   Audio Assistant Health Check"
echo "========================================"

# Check Backend
echo -n "Checking Backend ($BACKEND_URL)... "
if curl -s --head --request GET "$BACKEND_URL" | grep "200 OK" > /dev/null; then
  echo "✅ UP"
else
  echo "❌ DOWN"
  BACKEND_STATUS=1
fi

# Check Frontend
echo -n "Checking Frontend ($FRONTEND_URL)... "
# Frontend (Vite) might return 200 OK for the main page
if curl -s --head --request GET "$FRONTEND_URL" | grep "200 OK" > /dev/null; then
  echo "✅ UP"
else
  echo "❌ DOWN"
  FRONTEND_STATUS=1
fi

echo "========================================"

if [ "$BACKEND_STATUS" == "1" ] || [ "$FRONTEND_STATUS" == "1" ]; then
  echo "One or more services are down."
  exit 1
else
  echo "All systems operational."
  exit 0
fi
