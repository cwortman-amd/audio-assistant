#!/bin/bash

# Function to kill background processes on script exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p) 2>/dev/null
}

# Set up trap to call cleanup function on SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Starting Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Both services started."
echo "Backend running on PID $BACKEND_PID"
echo "Frontend running on PID $FRONTEND_PID"
echo "Press Ctrl+C to stop both services."

# Wait for both processes to finish (or until script is killed)
wait
