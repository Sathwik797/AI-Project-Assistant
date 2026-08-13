from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ----------------------------------------------------
# HEALTH SCHEMAS
# ----------------------------------------------------
class HealthComponentStatus(BaseModel):
    connected: Optional[bool] = None
    ready: Optional[bool] = None
    message: Optional[str] = None
    total_vectors: Optional[int] = None
    model: Optional[str] = None


class HealthResponse(BaseModel):
    status: str  # "healthy" or "degraded"
    database: Dict[str, Any]
    vector_store: Dict[str, Any]
    ai_service: Dict[str, Any]


# ----------------------------------------------------
# PROJECT SCHEMAS
# ----------------------------------------------------
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Project name (1-100 chars)")
    description: Optional[str] = Field(None, description="Optional project description")


class ProjectResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    total_documents: int = 0
    indexed_documents: int = 0
    total_storage_bytes: int = 0


# ----------------------------------------------------
# DOCUMENT SCHEMAS
# ----------------------------------------------------
class DocumentResponse(BaseModel):
    id: int
    project_id: int
    filename: str
    file_type: str
    file_size: int
    created_at: datetime
    is_indexed: bool = False
    chunk_count: int = 0

    class Config:
        from_attributes = True


class DocumentDetailResponse(DocumentResponse):
    file_path: str
    raw_text: Optional[str] = None


# ----------------------------------------------------
# RAG & AI SCHEMAS
# ----------------------------------------------------
class IndexInfoResponse(BaseModel):
    document_id: int
    project_id: int
    filename: str
    chunk_count: int
    status: str


class IndexResponse(BaseModel):
    success: bool
    message: str
    # Successful indexing always returns this metadata under index_info.
    index_info: Optional[IndexInfoResponse] = None


class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Question text")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Top K vector retrieval count")


class SourceResponse(BaseModel):
    filename: str
    chunk_index: int
    distance: float
    chunk_text: str


class QuestionResponse(BaseModel):
    success: bool
    answer: Optional[str] = None
    has_context: bool = False
    sources: List[SourceResponse] = []
    error: Optional[str] = None
