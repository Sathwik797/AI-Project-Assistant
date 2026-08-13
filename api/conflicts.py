from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.database import get_db_session
from services.models import Project, RequirementConflict
from services.ai_service import ask_gemini
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

    prompt = f"""You are a Systems Analyst. Scan project '{proj.name}' ({proj.description or ''}) for potential requirement ambiguities or specification conflicts.
Return a clear conflict report with resolution advice."""
    answer = ask_gemini(prompt)

    with get_db_session() as db:
        new_conflict = RequirementConflict(
            project_id=project_id,
            title=f"Specification Ambiguity in {proj.name}",
            severity="Medium",
            description=answer.strip(),
            source_a="project_spec.pdf",
            source_b="architecture_doc.docx",
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

