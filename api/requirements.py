from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.database import get_db_session
from services.models import Project, Requirement
from services.ai_service import ask_gemini
from api.auth import get_current_user_from_token, verify_project_ownership, UserResponse

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
def get_project_requirements(project_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    verify_project_ownership(project_id, current_user)
    with get_db_session() as db:
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
def create_requirement(project_id: int, payload: RequirementCreate, current_user: UserResponse = Depends(get_current_user_from_token)):
    verify_project_ownership(project_id, current_user)
    with get_db_session() as db:
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
def ai_generate_requirements(project_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    proj = verify_project_ownership(project_id, current_user)

    prompt = f"""You are a senior business analyst. Extract 1 key functional requirement for the software project titled '{proj.name}' ({proj.description or ''}).
Provide a concise title and detailed specification."""
    answer = ask_gemini(prompt)
    if not answer:
        raise HTTPException(status_code=503, detail="AI generation service is currently unavailable.")

    with get_db_session() as db:
        count = db.query(Requirement).filter(Requirement.project_id == project_id).count()
        code = f"REQ-{count + 1:03d}"
        
        # Extract title line or generate clean title
        title_line = f"AI Extracted Requirement for {proj.name}"
        if "\n" in answer:
            first_line = answer.split("\n")[0].replace("#", "").replace("*", "").strip()
            if len(first_line) > 5 and len(first_line) < 100:
                title_line = first_line

        new_req = Requirement(
            project_id=project_id,
            req_code=code,
            title=title_line,
            description=answer.strip(),
            priority="High",
            status="Approved",
            req_type="Functional"
        )
        db.add(new_req)
        db.flush()

        created_req = RequirementSchema(
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

    return {
        "project_id": project_id,
        "generated_text": answer,
        "created_requirement": created_req
    }

