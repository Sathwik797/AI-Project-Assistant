# AI Project Assistant 🚀

**AI Project Assistant** is an enterprise-grade, AI-powered software project intelligence platform designed to streamline software engineering specifications, document understanding, agile user story synthesis, development task breakdown, and requirement conflict detection.

Powered by **FastAPI**, **MySQL**, **ChromaDB**, **SentenceTransformers**, **Google Gemini 2.5 Flash**, and **React 19**, the platform delivers a grounded Retrieval-Augmented Generation (RAG) workspace tailored for Product Managers, Lead Architects, Developers, and QA Engineers.

---

## 🏗 Complete System Architecture

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 REACT 19 + VITE CLIENT                  │
                  │   (Port 5173 / Single Page Enterprise SaaS Frontend)    │
                  └────────────────────────────┬────────────────────────────┘
                                               │
                                               │ HTTP REST / Bearer JWT
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                  FASTAPI API BACKEND                    │
                  │              (Port 8000 / Uvicorn Server)               │
                  └──────┬─────────────────────┬─────────────────────┬──────┘
                         │                     │                     │
                         ▼                     ▼                     ▼
        ┌──────────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │  JWT AUTH & AUTHORIZATION│ │ AI COPILOT ROUTER │ │ DOCUMENT RAG &    │
        │  • User Registration     │ │ • Main App Helper │ │   INGESTION       │
        │  • Token Verification    │ │ • DB Metrics      │ │ • Text Extractor  │
        │  • Owner ID Isolation    │ │ • System Guidance │ │ • Chunking Engine │
        └────────────┬─────────────┘ └─────────┬─────────┘ └─────────┬─────────┘
                     │                         │                     │
                     ▼                         ▼                     ▼
        ┌──────────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │     MYSQL DATABASE       │ │ GOOGLE GEMINI 2.5 │ │  CHROMADB VECTOR  │
        │       (Port 3306)        │ │     FLASH LLM     │ │       STORE       │
        │ • users & projects       │ │ • Grounded RAG QA │ │ • Chunk Vectors   │
        │ • documents & text       │ │ • Requirements    │ │ • Project Context │
        │ • requirements & stories │ │ • User Stories    │ │ • Cosine Similarity│
        │ • tasks & conflicts      │ │ • Task Breakdown  │ │   Similarity      │
        └──────────────────────────┘ └───────────────────┘ └───────────────────┘
```

---

## 🔄 End-to-End Intelligence Pipeline

```
┌───────────────────┐
│ Project Documents │  (PDF, DOCX, TXT Uploads)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Document AI / RAG │  (PyMuPDF, python-docx, SentenceTransformers, ChromaDB)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Requirements    │  (Functional & Non-Functional Specifications Matrix)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   User Stories    │  (Agile Persona, Goal, Benefit & Acceptance Checklists)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Engineering Tasks │  (Sprint Breakdown & Kanban Task Board)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Conflicts / Risks │  (Specification Ambiguity & Contradiction Scanner)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Command Center   │  (Executive Project Intelligence & Metrics Dashboard)
└───────────────────┘
```

---

## 🌟 Core Features & Modules

### 1. 🔒 Authentication & Multi-Tenant Project Ownership
- User registration, login, and JWT bearer token issuance.
- Strict database ownership isolation: Projects and associated artifacts (documents, requirements, stories, tasks, conflicts) are scoped to `owner_id == current_user.id`.

### 2. ⚡ Grounded Project RAG Vector Search
- Upload PDF, DOCX, or TXT project documents.
- Automatic text extraction, recursive chunking, embedding generation via `all-MiniLM-L6-v2`, and vector indexing in ChromaDB.
- Submit project-wide natural language queries with grounded answers and exact source citations (file name, chunk index, match relevance score).

### 3. 🤖 Dual AI Copilot Architecture
- **Main Floating AI Copilot (`POST /api/copilot/chat`)**: Provides application navigation advice, feature guidance, agile best practices, and real-time database project metrics.
- **Document AI Copilot (`POST /api/documents/{id}/chat`)**: Dedicated split-screen document reader copilot that directly analyzes document raw text for summarization and specification extraction.

### 4. 📋 Requirements Matrix & Real AI Generation
- Functional and Non-Functional Requirements management.
- Generates new requirements using Gemini LLM and **persists real records directly into MySQL**.

### 5. 📖 Agile User Stories & Acceptance Criteria
- Synthesizes user stories (`As a [Role], I want [Goal], so that [Benefit]`).
- Generates testable acceptance criteria checklists persisted directly to MySQL.

### 6. 📌 Technical Task Breakdown & Kanban Board
- Decomposes high-level project specifications into actionable engineering tasks.
- Tracks task status (`To Do`, `In Progress`, `Review`, `Done`), priority, assignee, and due dates across Kanban and List views.

### 7. ⚠️ Conflict & Contradiction Scanner
- Scans project documentation to surface contradictory specifications, missing rules, and ambiguous requirements.
- Recommends resolution paths to align engineering leads before sprint execution.

---

## 🛠 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 19, Vite, Tailwind CSS v4, React Router v7, Lucide Icons, Axios |
| **API Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic V2 |
| **Database & ORM** | MySQL 8.0+, SQLAlchemy, PyMySQL |
| **Vector Database** | ChromaDB (Project-isolated vector collections) |
| **Embeddings Model** | SentenceTransformers (`all-MiniLM-L6-v2`) |
| **AI LLM Engine** | Google GenAI SDK (`gemini-2.5-flash`) |
| **Authentication** | PyJWT (HS256), SHA256 PBKDF2 Password Hashing |
| **Testing** | Pytest, Python TestClient, Node Test Runner |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: `v3.11` or higher
- **Node.js**: `v18.0` or higher
- **MySQL**: Running instance (default database: `project_assistant`)

---

### 2. Environment Setup

Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=project_assistant
JWT_SECRET_KEY=your_secure_jwt_secret_key_2026
```

---

### 3. Backend Setup & Startup

```powershell
# 1. Clone repository
git clone https://github.com/Sathwik797/AI-Project-Assistant.git
cd AI-Project-Assistant

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start FastAPI Backend Server
$env:PYTHONPATH="."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 4. Frontend Setup & Startup

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start React Vite Dev Server
npm run dev
```

- **Web Application URL**: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing & Verification

### Run Backend Pytest Suite
```powershell
.\venv\Scripts\python.exe -m pytest tests/ -v
```

### Run Frontend Contract Tests
```powershell
cd frontend
npm test
```

### Build Production Bundle
```powershell
cd frontend
npm run build
```

---

## 🔑 Key API Reference

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | System status check for MySQL, ChromaDB, & Gemini |
| `/api/auth/signup` | `POST` | Public | Register new user account |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/api/auth/me` | `GET` | Protected | Return current user details |
| `/api/projects` | `GET`, `POST` | Protected | List user projects or create new project |
| `/api/projects/{id}/documents` | `GET`, `POST` | Protected | List or upload project documents |
| `/api/documents/{id}/chat` | `POST` | Protected | Direct Document AI raw text summarization |
| `/api/documents/{id}/index` | `POST` | Protected | Index document into ChromaDB vector store |
| `/api/projects/{id}/ask` | `POST` | Protected | Grounded Project RAG vector query |
| `/api/copilot/chat` | `POST` | Protected | Main Floating AI Copilot assistant |
| `/api/projects/{id}/requirements/ai-generate` | `POST` | Protected | AI generate & persist requirement to MySQL |
| `/api/projects/{id}/user-stories/ai-generate` | `POST` | Protected | AI generate & persist user story to MySQL |
| `/api/projects/{id}/tasks/ai-generate` | `POST` | Protected | AI generate & persist engineering task to MySQL |
| `/api/projects/{id}/conflicts/ai-generate` | `POST` | Protected | AI scan & persist conflict to MySQL |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
