# student-organiser-rag-llm

(Overview sentence)

### Technical Diaries
Ashley:
https://wehieduau.sharepoint.com/:w:/r/sites/StudentInternGroupatWEHI/Shared%20Documents/RAG%20LLM/2025%20Semester%201%20Intake/Ashley%20Technical%20Diary.docx?d=wa134dcf226af429dba54e48b318832ea&csf=1&web=1&e=15U5Fn 

Olivia: 
https://wehieduau.sharepoint.com/:w:/r/sites/StudentInternGroupatWEHI/Shared%20Documents/RAG%20LLM/2025%20Semester%201%20Intake/Olivia%20Technical%20Diary.docx?d=w2fdda3159fd044a49d4cbf810b92a7a8&csf=1&web=1&e=9ZpS3S

## 💬 User Interface Setup (locally)
### Prerequisites

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

### Setup

1. **Install frontend dependencies**

   ```bash
   yarn install
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```
   BACKEND_API_URL=http://localhost:5000/chat
   ```

### Running the Application

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
   # Open up a second terminal
   yarn dev
   ```

   The frontend will be available at `http://localhost:3000`

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`


## 🍯 Nectar Project Setup

(Include steps for connecting to the VM we created)

## 🔧 Chatbot Architecture
### Front-end (UI)

(Include tool used)

### Data processing

- **PDF extraction:** `PyPDFLoader` from LangChain

- **Web scraping:** `BeautifulSoup`

- **TF-IDF:** `TfidfVectorizer` from scikit-learn

### Data storage

- **Vector database:** `Chroma` from LangChain
- **Embedding model:** `all-MiniLM-L6-v2` from HuggingFace Embeddings

### Search methods

- **Keyword search:** TF-IDF and Cosine Similarity

- **Semantic search:** 

- **LLM:** Langchain

### Response

(Include threshold and response format)

## 📝 Example Queries

(Include which questions are used to test chatbot)

### Easy Queries

(Include questions)

### Moderate Queries

(Include questions)

### Complex Queries

(Include questions)

## 🔬 Performance Evaluation

(Include accuracy score, response time and evaluation methodology/criteria)

## 🚀 Future tasks

(Include the next steps for future intakes)
