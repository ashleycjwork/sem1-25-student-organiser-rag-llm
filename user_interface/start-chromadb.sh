#!/bin/bash

# Kill any existing ChromaDB processes
pkill -f "chroma run"

# Wait a moment to ensure processes are terminated
sleep 2

# Create the data directory and subdirectory if they don't exist
mkdir -p ./data
mkdir -p ./data/chroma_db

# Start ChromaDB and redirect output to a log file
nohup chroma run --path ./data/chroma_db > ./data/chroma.log 2>&1 &

# Wait for the server to start
sleep 3

# Check if the server is running
if curl -s http://localhost:8000/api/v1/heartbeat > /dev/null; then
    echo "ChromaDB server started successfully"
    echo "Logs are available at ./data/chroma.log"
else
    echo "Failed to start ChromaDB server"
    echo "Check ./data/chroma.log for details"
fi