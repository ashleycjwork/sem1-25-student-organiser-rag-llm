# AI Chatbot with Groq

A modern AI chatbot application built with Next.js, Flask, and Groq.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Homebrew** (macOS package manager)

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Node.js** (v18 or later)

   ```bash
   brew install node
   ```

3. **Yarn** (package manager)

   ```bash
   brew install yarn
   ```

4. **Docker** (for running the backend)
   ```bash
   brew install --cask docker
   ```

## Project Structure

```
.
├── app/                # Next.js frontend
├── server.py           # Flask backend
├── Dockerfile          # Backend Docker configuration
├── docker-compose.yml  # Docker Compose configuration
└── README.md
```

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install frontend dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```
   BACKEND_API_URL=http://localhost:5000/chat
   ```

## Running the Application

1. **Start Docker Desktop**

   ```bash
   # Open Docker Desktop from terminal
   open -a Docker
   ```

2. **Start the backend server using Docker Compose**

   ```bash
   # Build and start the backend container
   docker-compose up
   ```

   The backend will be available at `http://localhost:5000`

3. **Start the frontend development server**

   ```bash
   yarn dev
   ```

   The frontend will be available at `http://localhost:3000`

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Development

- Frontend code is in the `app` directory
- Backend code is in `server.py`
- Use `yarn` for all frontend package management
- Backend runs in Docker container
