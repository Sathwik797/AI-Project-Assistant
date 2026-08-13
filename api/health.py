import os
from fastapi import APIRouter
from api.schemas import HealthResponse
from services.database import check_db_connection
from services.vector_store_service import get_total_vector_count
from services.ai_service import DEFAULT_MODEL_NAME

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
def get_health_status():
    """
    Returns system health status for Database, Vector Store, and Gemini AI Service.
    """
    db_connected, db_message = check_db_connection()
    
    # Vector store check
    try:
        vector_count = get_total_vector_count()
        vector_ready = True
    except Exception:
        vector_count = 0
        vector_ready = False

    # Gemini service check
    gemini_key = os.getenv("GEMINI_API_KEY")
    ai_ready = bool(gemini_key and gemini_key.strip())

    overall_status = "healthy" if (db_connected and vector_ready and ai_ready) else "degraded"

    return HealthResponse(
        status=overall_status,
        database={
            "connected": db_connected,
            "message": db_message
        },
        vector_store={
            "ready": vector_ready,
            "total_vectors": vector_count
        },
        ai_service={
            "ready": ai_ready,
            "model": DEFAULT_MODEL_NAME
        }
    )
