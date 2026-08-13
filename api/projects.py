from typing import List
from fastapi import APIRouter, HTTPException, status
from api.schemas import ProjectCreate, ProjectResponse, ProjectDetailResponse
from services.project_service import create_project, get_projects, get_project, update_project, delete_project
from services.document_service import get_documents_by_project
from services.rag_ingestion_service import get_document_index_status

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects():
    return get_projects()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(payload: ProjectCreate):
    ok, msg, new_proj = create_project(payload.name, payload.description)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=msg
        )
    return new_proj


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project_details(project_id: int):
    proj = get_project(project_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )

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


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project_details(project_id: int, payload: ProjectCreate):
    ok, msg, updated_proj = update_project(project_id, payload.name, payload.description)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    return updated_proj


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project_workspace(project_id: int):
    ok, msg = delete_project(project_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    return {"message": msg, "project_id": project_id}
