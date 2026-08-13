import os
from contextlib import contextmanager
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

Base = declarative_base()

_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise ValueError("DATABASE_URL is not set in environment variables.")
        _engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False
        )
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal


@contextmanager
def get_db_session():
    """Context manager for obtaining a clean database session."""
    session_factory = get_session_factory()
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """Initialize database tables using SQLAlchemy metadata."""
    from services.models import Project, Document, User, Requirement, UserStory, TaskItem, RequirementConflict
    engine = get_engine()
    Base.metadata.create_all(bind=engine)


def check_db_connection() -> tuple[bool, str]:
    """Check database connection health without exposing raw credentials."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return False, "DATABASE_URL is not configured in .env"
    try:
        engine = get_engine()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Connected successfully"
    except Exception:
        return False, "Failed to connect to MySQL database. Please verify your connection configuration."
