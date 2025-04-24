# Use a lightweight Python image
FROM python:3.9-slim

# Install ChromaDB
RUN pip install chromadb

# Set the working directory
WORKDIR /app

# Copy the database and script
COPY data/chroma_db /app/data/chroma_db
COPY start-chromadb.sh /app/start-chromadb.sh

# Expose the port ChromaDB runs on
EXPOSE 8000

# Start the ChromaDB server
CMD ["bash", "start-chromadb.sh"]