import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.database import init_db, check_db_connection
from api.health import router as health_router
from api.projects import router as projects_router
from api.documents import router as documents_router
from api.rag import router as rag_router
from api.auth import router as auth_router
from api.requirements import router as requirements_router
from api.stories import router as stories_router
from api.tasks import router as tasks_router
from api.conflicts import router as conflicts_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ai_project_assistant")

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for safe database initialization on startup."""
    logger.info("Initializing AI Project Assistant API backend...")
    db_ok, db_msg = check_db_connection()
    if db_ok:
        try:
            init_db()
            logger.info("Database tables initialized successfully.")
        except Exception as e:
            logger.error(f"Error during database initialization: {e}")
    else:
        logger.warning(f"Database connection check warning: {db_msg}")
    
    yield
    
    logger.info("Shutting down AI Project Assistant API backend...")


# Initialize FastAPI Application
app = FastAPI(
    title="AI Project Assistant API",
    description="REST API backend layer for AI Project Assistant SaaS application.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
cors_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(rag_router, prefix="/api")
app.include_router(requirements_router, prefix="/api")
app.include_router(stories_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(conflicts_router, prefix="/api")


@app.get("/")
def root():
    """Root API welcome endpoint."""
    return {
        "app": "AI Project Assistant API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
