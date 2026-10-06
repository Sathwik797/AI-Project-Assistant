from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.database import get_db_session
from services.models import Project, RequirementConflict
from services.ai_service import ask_gemini
from services.ai_service import answer_rag_question
from services.document_service import get_documents_by_project
from api.auth import get_current_user_from_token, verify_project_ownership, UserResponse

router = APIRouter(prefix="/projects/{project_id}/conflicts", tags=["Conflicts"])


class ConflictSchema(BaseModel):
    id: int
    project_id: int
    title: str
    severity: str
    description: str
    source_a: Optional[str] = None
    source_b: Optional[str] = None
    resolution: Optional[str] = None
    status: str
    created_at: str


class ConflictCreate(BaseModel):
    title: str
    severity: str = "High"
    description: str
    source_a: Optional[str] = None
    source_b: Optional[str] = None
    resolution: Optional[str] = None


@router.get("", response_model=List[ConflictSchema])
def get_project_conflicts(project_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    verify_project_ownership(project_id, current_user)
    with get_db_session() as db:
        conflicts = db.query(RequirementConflict).filter(RequirementConflict.project_id == project_id).order_by(RequirementConflict.id.asc()).all()
        return [
            ConflictSchema(
                id=c.id,
                project_id=c.project_id,
                title=c.title,
                severity=c.severity,
                description=c.description,
                source_a=c.source_a,
                source_b=c.source_b,
                resolution=c.resolution,
                status=c.status,
                created_at=c.created_at.isoformat()
            )
            for c in conflicts
        ]


@router.post("", response_model=ConflictSchema, status_code=status.HTTP_201_CREATED)
def create_conflict(project_id: int, payload: ConflictCreate, current_user: UserResponse = Depends(get_current_user_from_token)):
    verify_project_ownership(project_id, current_user)
    with get_db_session() as db:
        new_conflict = RequirementConflict(
            project_id=project_id,
            title=payload.title.strip(),
            severity=payload.severity,
            description=payload.description.strip(),
            source_a=payload.source_a,
            source_b=payload.source_b,
            resolution=payload.resolution,
            status="Open"
        )
        db.add(new_conflict)
        db.flush()

        return ConflictSchema(
            id=new_conflict.id,
            project_id=new_conflict.project_id,
            title=new_conflict.title,
            severity=new_conflict.severity,
            description=new_conflict.description,
            source_a=new_conflict.source_a,
            source_b=new_conflict.source_b,
            resolution=new_conflict.resolution,
            status=new_conflict.status,
            created_at=new_conflict.created_at.isoformat()
        )


@router.post("/ai-generate")
def ai_scan_conflicts(project_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    proj = verify_project_ownership(project_id, current_user)

    documents = get_documents_by_project(project_id)
    if not documents:
        raise HTTPException(status_code=400, detail="Upload at least one project document before running a conflict scan.")

    rag_result = answer_rag_question(
        project_id,
        "Identify concrete contradictions, ambiguities, or incompatible requirements across the project documents. Cite the relevant document names and explain a practical resolution for each issue."
    )
    if not rag_result.get("success"):
        raise HTTPException(status_code=503, detail=rag_result.get("error", "Conflict analysis service is currently unavailable."))
    answer = rag_result.get("answer") or "No conflicts were identified."
    source_names = sorted({src.get("filename") for src in rag_result.get("sources", []) if src.get("filename")})

    with get_db_session() as db:
        new_conflict = RequirementConflict(
            project_id=project_id,
            title=f"Specification Ambiguity in {proj.name}",
            severity="Medium",
            description=answer.strip(),
            source_a=source_names[0] if source_names else None,
            source_b=source_names[1] if len(source_names) > 1 else None,
            resolution="Harmonize document specifications across team leads.",
            status="Open"
        )
        db.add(new_conflict)
        db.flush()

        created_conflict = ConflictSchema(
            id=new_conflict.id,
            project_id=new_conflict.project_id,
            title=new_conflict.title,
            severity=new_conflict.severity,
            description=new_conflict.description,
            source_a=new_conflict.source_a,
            source_b=new_conflict.source_b,
            resolution=new_conflict.resolution,
            status=new_conflict.status,
            created_at=new_conflict.created_at.isoformat()
        )

    return {
        "project_id": project_id,
        "generated_text": answer,
        "created_conflict": created_conflict
    }

