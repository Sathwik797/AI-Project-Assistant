from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from services.database import get_db_session
from services.models import Project, RequirementConflict
from services.ai_service import ask_gemini

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
def get_project_conflicts(project_id: int):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

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
def create_conflict(project_id: int, payload: ConflictCreate):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

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
def ai_scan_conflicts(project_id: int):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        prompt = f"""You are a Systems Analyst. Scan project '{project.name}' ({project.description or ''}) for potential requirement ambiguities or specification conflicts."""
        answer = ask_gemini(prompt)

        return {
            "project_id": project_id,
            "generated_text": answer,
            "draft_conflict": {
                "title": f"Specification Ambiguity in {project.name}",
                "severity": "Medium",
                "description": answer[:300] + "...",
                "source_a": "requirements_spec.pdf",
                "source_b": "architecture_doc.docx",
                "resolution": "Harmonize document specifications across team leaders."
            }
        }
