from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from services.database import get_db_session
from services.models import Project, Requirement
from services.ai_service import ask_gemini

router = APIRouter(prefix="/projects/{project_id}/requirements", tags=["Requirements"])


class RequirementSchema(BaseModel):
    id: int
    project_id: int
    req_code: str
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    req_type: str
    created_at: str


class RequirementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "High"
    req_type: str = "Functional"
    req_code: Optional[str] = None


@router.get("", response_model=List[RequirementSchema])
def get_project_requirements(project_id: int):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        reqs = db.query(Requirement).filter(Requirement.project_id == project_id).order_by(Requirement.id.asc()).all()
        return [
            RequirementSchema(
                id=r.id,
                project_id=r.project_id,
                req_code=r.req_code,
                title=r.title,
                description=r.description,
                priority=r.priority,
                status=r.status,
                req_type=r.req_type,
                created_at=r.created_at.isoformat()
            )
            for r in reqs
        ]


@router.post("", response_model=RequirementSchema, status_code=status.HTTP_201_CREATED)
def create_requirement(project_id: int, payload: RequirementCreate):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        count = db.query(Requirement).filter(Requirement.project_id == project_id).count()
        code = payload.req_code or f"REQ-{count + 1:03d}"

        new_req = Requirement(
            project_id=project_id,
            req_code=code,
            title=payload.title.strip(),
            description=payload.description.strip() if payload.description else None,
            priority=payload.priority,
            status="Approved",
            req_type=payload.req_type
        )
        db.add(new_req)
        db.flush()

        return RequirementSchema(
            id=new_req.id,
            project_id=new_req.project_id,
            req_code=new_req.req_code,
            title=new_req.title,
            description=new_req.description,
            priority=new_req.priority,
            status=new_req.status,
            req_type=new_req.req_type,
            created_at=new_req.created_at.isoformat()
        )


@router.post("/ai-generate")
def ai_generate_requirements(project_id: int):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        prompt = f"""You are a senior business analyst. Extract 3 key functional requirements for the project titled '{project.name}' ({project.description or ''}).
Format response as clear requirement specs."""
        answer = ask_gemini(prompt)
        
        return {
            "project_id": project_id,
            "generated_text": answer,
            "draft_requirement": {
                "req_code": "REQ-AI-01",
                "title": f"Extracted Requirement for {project.name}",
                "description": answer[:300] + "...",
                "priority": "High",
                "req_type": "Functional"
            }
        }
