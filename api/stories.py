from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from services.database import get_db_session
from services.models import Project, UserStory
from services.ai_service import ask_gemini

router = APIRouter(prefix="/projects/{project_id}/user-stories", tags=["User Stories"])


class UserStorySchema(BaseModel):
    id: int
    project_id: int
    story_code: str
    title: str
    user_role: str
    goal: str
    benefit: str
    priority: str
    status: str
    acceptance_criteria: Optional[str] = None
    created_at: str


class UserStoryCreate(BaseModel):
    title: str
    user_role: str
    goal: str
    benefit: str
    priority: str = "High"
    acceptance_criteria: Optional[str] = None
    story_code: Optional[str] = None


@router.get("", response_model=List[UserStorySchema])
def get_project_stories(project_id: int):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        stories = db.query(UserStory).filter(UserStory.project_id == project_id).order_by(UserStory.id.asc()).all()
        return [
            UserStorySchema(
                id=s.id,
                project_id=s.project_id,
                story_code=s.story_code,
                title=s.title,
                user_role=s.user_role,
                goal=s.goal,
                benefit=s.benefit,
                priority=s.priority,
                status=s.status,
                acceptance_criteria=s.acceptance_criteria,
                created_at=s.created_at.isoformat()
            )
            for s in stories
        ]


@router.post("", response_model=UserStorySchema, status_code=status.HTTP_201_CREATED)
def create_user_story(project_id: int, payload: UserStoryCreate):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        count = db.query(UserStory).filter(UserStory.project_id == project_id).count()
        code = payload.story_code or f"US-{count + 1:03d}"

        new_story = UserStory(
            project_id=project_id,
            story_code=code,
            title=payload.title.strip(),
            user_role=payload.user_role.strip(),
            goal=payload.goal.strip(),
            benefit=payload.benefit.strip(),
            priority=payload.priority,
            status="Approved",
            acceptance_criteria=payload.acceptance_criteria
        )
        db.add(new_story)
        db.flush()

        return UserStorySchema(
            id=new_story.id,
            project_id=new_story.project_id,
            story_code=new_story.story_code,
            title=new_story.title,
            user_role=new_story.user_role,
            goal=new_story.goal,
            benefit=new_story.benefit,
            priority=new_story.priority,
            status=new_story.status,
            acceptance_criteria=new_story.acceptance_criteria,
            created_at=new_story.created_at.isoformat()
        )


@router.post("/ai-generate")
def ai_generate_user_stories(project_id: int):
    with get_db_session() as db:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        prompt = f"""You are an agile Product Owner. Generate a user story with acceptance criteria for '{project.name}' ({project.description or ''}).
Format as: As a [role], I want [goal], so that [benefit]."""
        answer = ask_gemini(prompt)

        return {
            "project_id": project_id,
            "generated_text": answer,
            "draft_story": {
                "story_code": "US-AI-01",
                "title": f"Agile Feature for {project.name}",
                "user_role": "Product Manager",
                "goal": "Query project documents using AI RAG",
                "benefit": "Accelerate requirements verification",
                "priority": "High",
                "acceptance_criteria": "1. Document is indexed in ChromaDB.\n2. Gemini QA returns grounded source citations."
            }
        }
