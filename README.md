# AI Project Assistant 🚀

**AI Project Assistant** is an enterprise-grade, AI-powered project intelligence platform designed to streamline software engineering requirements, document management, agile user story creation, development task breakdown, and specification conflict detection.

Powered by **FastAPI**, **MySQL**, **ChromaDB**, **SentenceTransformers**, **Google Gemini AI**, and **React 19**, the platform delivers a grounded Retrieval-Augmented Generation (RAG) workspace tailored for technical product managers, lead architects, developers, and QA engineers.

---

## 🌟 Core Features

- **⚡ Grounded Project RAG Answering**: Upload PDF, DOCX, or TXT project documents, extract text, chunk and index embeddings into ChromaDB vector stores, and ask natural language questions with exact source citations.
- **📋 Requirements Matrix**: Organize functional, technical, and non-functional specifications. Automatically extract requirements from uploaded project documents using Gemini AI.
- **📖 Agile User Stories & Acceptance Criteria**: Automatically generate structured user stories (`As a [Role], I want [Goal], so that [Benefit]`) complete with acceptance criteria checklists.
- **📌 Technical Task Breakdown**: Convert high-level project specifications into actionable engineering tasks. View progress across Kanban boards and List views.
- **⚠️ Conflict & Ambiguity Detection**: Scan project documentation to surface contradictory specifications, missing details, and ambiguous requirements before development begins.
- **🔒 JWT Authentication**: Secure multi-tenant user authentication, password hashing, user roles, and access controls.
- **🎨 Modern Enterprise SaaS UI & Theme Engine**: Polished Apple/Linear-inspired interface supporting Light Mode, Dark Mode, and System Preference synchronization.
- **⌘K Command Palette**: Instant keyboard-driven global search across projects, documents, requirements, and tasks.

---

## 🏗 Architecture & Stack

```
   React 19 + Vite + Tailwind CSS v4 (Port 5173)
                       │
                       ▼  HTTP REST APIs / JWT Bearer Tokens
          FastAPI REST Server (Port 8000)
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   MySQL Database   ChromaDB     Gemini 2.5 Flash
  (Persistence)  (Vector RAG)     (LLM Engine)
```

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, PyMySQL, Uvicorn
- **Vector Store & Embeddings**: ChromaDB, SentenceTransformers (`all-MiniLM-L6-v2`)
- **LLM Engine**: Google GenAI SDK (`gemini-2.5-flash`)
- **Authentication**: PyJWT, SHA256 PBKDF2 Password Hashing
- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Lucide React

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: `v3.11` or higher
- **Node.js**: `v18.0` or higher
- **MySQL**: Server running locally or remotely (default database: `project_assistant`)

---

### 2. Backend Setup

1. **Clone Repository & Navigate to Root**:
   ```powershell
   git clone https://github.com/Sathwik797/AI-Project-Assistant.git
   cd AI-Project-Assistant
   ```

2. **Create & Activate Virtual Environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=project_assistant
   JWT_SECRET_KEY=your_secure_jwt_secret_key_2026
   ```

5. **Start FastAPI Backend Server**:
   ```powershell
   $env:PYTHONPATH="."
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   FastAPI interactive documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 3. Frontend Setup

1. **Navigate to Frontend Directory**:
   ```powershell
   cd frontend
   ```

2. **Install Node Dependencies**:
   ```powershell
   npm install
   ```

3. **Start React Vite Development Server**:
   ```powershell
   npm run dev
   ```
   The application will be accessible at [http://localhost:5173](http://localhost:5173).

---

## 📂 Project Structure

```
AI-Project-Assistant/
├── api/                     # FastAPI REST Routers
│   ├── auth.py              # User Registration, Login & JWT Token Management
│   ├── projects.py          # Project Management CRUD APIs
│   ├── documents.py         # Document Upload, Extraction & Deletion APIs
│   ├── requirements.py       # Requirements Matrix & AI Extraction APIs
│   ├── stories.py           # User Story Generation & Acceptance Criteria APIs
│   ├── tasks.py             # Technical Task Breakdown & Kanban APIs
│   └── conflicts.py         # Conflict & Ambiguity Detection APIs
│
├── services/                # Core Python Business Logic & Data Services
│   ├── models.py            # SQLAlchemy Database Schemas
│   ├── database.py          # MySQL Connection Session Lifecycle
│   ├── document_service.py  # PDF/DOCX/TXT Text Extraction Engine
│   ├── embedding_service.py # SentenceTransformer Embedding Generator
│   ├── rag_service.py       # ChromaDB Vector Store Ingestion & Retrieval
│   └── ai_service.py        # Gemini Grounded LLM Prompting Pipeline
│
├── frontend/                # React 19 Frontend Client Application
│   ├── src/
│   │   ├── components/      # Reusable UI & Modal Components
│   │   ├── contexts/        # AuthContext & ThemeContext State Providers
│   │   ├── layouts/         # Workspace Main Layout Wrapper
│   │   ├── pages/           # Module Views (Overview, Assistant, Documents, etc.)
│   │   ├── services/        # Axios API Client Interceptors
│   │   └── App.jsx          # Protected Routes & Application Entry Point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── uploads/                 # Uploaded Project Document Storage
├── main.py                  # FastAPI Application Entrypoint & CORS Middleware
├── requirements.txt         # Python Package Dependencies
├── README.md                # Project Documentation
└── .gitignore               # Ignored Build Artifacts & Credentials
```

---

## 🔑 REST API Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health Check & Database Status |
| `/api/auth/signup` | `POST` | Register User Account |
| `/api/auth/login` | `POST` | Authenticate User & Return JWT Token |
| `/api/auth/me` | `GET` | Retrieve Active Authenticated User Details |
| `/api/projects` | `GET`, `POST` | List or Create Project Workspaces |
| `/api/projects/{id}/documents` | `GET`, `POST` | List or Upload Project Documents |
| `/api/projects/{id}/ask` | `POST` | Submit Grounded RAG Query to Gemini |
| `/api/projects/{id}/requirements` | `GET`, `POST` | Manage Requirements Matrix |
| `/api/projects/{id}/user-stories` | `GET`, `POST` | Manage Agile User Stories |
| `/api/projects/{id}/tasks` | `GET`, `POST` | Manage Engineering Technical Tasks |
| `/api/projects/{id}/conflicts` | `GET`, `POST` | Manage Requirement Conflict Analysis |

---

## 🔒 Security Notice

- Environment credentials (`.env`), vector stores (`chroma_db/`), uploaded document files (`uploads/*`), Python virtual environments (`venv/`), and Node build artifacts (`node_modules/`, `dist/`) are intentionally excluded from git source control.
- Never commit live API keys or database credentials to public repositories.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
