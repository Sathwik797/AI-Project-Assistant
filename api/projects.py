from typing import List
from fastapi import APIRouter, HTTPException, status
from api.schemas import ProjectCreate, ProjectResponse, ProjectDetailResponse
from services.project_service import create_project, get_projects, get_project
from services.document_service import get_documents_by_project
from services.rag_ingestion_service import get_document_index_status

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects():
    """Retrieves all projects ordered by creation date descending."""
    return get_projects()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(payload: ProjectCreate):
    """
    Creates a new project record.
    Validation: Name required, non-empty, max 100 characters.
    """
    ok, msg, new_proj = create_project(payload.name, payload.description)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=msg
        )
    return new_proj


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project_details(project_id: int):
    """Retrieves project details including real-time document and indexing metrics."""
    proj = get_project(project_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )

    # Calculate real project metrics from services
    docs = get_documents_by_project(project_id)
    total_docs = len(docs)
    indexed_docs = sum(1 for d in docs if get_document_index_status(d.id)["is_indexed"])
    total_bytes = sum(d.file_size for d in docs)

    return ProjectDetailResponse(
        id=proj.id,
        name=proj.name,
        description=proj.description,
        created_at=proj.created_at,
        updated_at=proj.updated_at,
        total_documents=total_docs,
        indexed_documents=indexed_docs,
        total_storage_bytes=total_bytes
    )
