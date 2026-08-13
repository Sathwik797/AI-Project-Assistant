from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.database import get_db_session
from services.models import Project, TaskItem
from services.ai_service import ask_gemini
from api.auth import get_current_user_from_token, verify_project_ownership, UserResponse

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["Tasks"])


class TaskSchema(BaseModel):
    id: int
    project_id: int
    task_code: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assignee: str
    due_date: Optional[str] = None
    created_at: str


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "To Do"
    priority: str = "Medium"
    assignee: str = "Unassigned"
    due_date: Optional[str] = None
    task_code: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None


@router.get("", response_model=List[TaskSchema])
def get_project_tasks(project_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    verify_project_ownership(project_id, current_user)
    with get_db_session() as db:
        tasks = db.query(TaskItem).filter(TaskItem.project_id == project_id).order_by(TaskItem.id.asc()).all()
        return [
            TaskSchema(
                id=t.id,
                project_id=t.project_id,
                task_code=t.task_code,
                title=t.title,
                description=t.description,
                status=t.status,
                priority=t.priority,
                assignee=t.assignee,
                due_date=t.due_date,
                created_at=t.created_at.isoformat()
            )
            for t in tasks
        ]


@router.post("", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
def create_task(project_id: int, payload: TaskCreate, current_user: UserResponse = Depends(get_current_user_from_token)):
    verify_project_ownership(project_id, current_user)
    with get_db_session() as db:
        count = db.query(TaskItem).filter(TaskItem.project_id == project_id).count()
        code = payload.task_code or f"TSK-{count + 1:03d}"

        new_task = TaskItem(
            project_id=project_id,
            task_code=code,
            title=payload.title.strip(),
            description=payload.description.strip() if payload.description else None,
            status=payload.status,
            priority=payload.priority,
            assignee=payload.assignee,
            due_date=payload.due_date
        )
        db.add(new_task)
        db.flush()

        return TaskSchema(
            id=new_task.id,
            project_id=new_task.project_id,
            task_code=new_task.task_code,
            title=new_task.title,
            description=new_task.description,
            status=new_task.status,
            priority=new_task.priority,
            assignee=new_task.assignee,
            due_date=new_task.due_date,
            created_at=new_task.created_at.isoformat()
        )


@router.put("/{task_id}", response_model=TaskSchema)
def update_task(project_id: int, task_id: int, payload: TaskUpdate, current_user: UserResponse = Depends(get_current_user_from_token)):
    verify_project_ownership(project_id, current_user)
    with get_db_session() as db:
        task = db.query(TaskItem).filter(TaskItem.id == task_id, TaskItem.project_id == project_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if payload.title is not None:
            task.title = payload.title.strip()
        if payload.description is not None:
            task.description = payload.description.strip()
        if payload.status is not None:
            task.status = payload.status
        if payload.priority is not None:
            task.priority = payload.priority
        if payload.assignee is not None:
            task.assignee = payload.assignee
        
        db.flush()

        return TaskSchema(
            id=task.id,
            project_id=task.project_id,
            task_code=task.task_code,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            assignee=task.assignee,
            due_date=task.due_date,
            created_at=task.created_at.isoformat()
        )


@router.post("/ai-generate")
def ai_generate_tasks(project_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    proj = verify_project_ownership(project_id, current_user)

    prompt = f"""You are a Lead Software Architect. Break down '{proj.name}' ({proj.description or ''}) into 1 engineering implementation task."""
    answer = ask_gemini(prompt)

    with get_db_session() as db:
        count = db.query(TaskItem).filter(TaskItem.project_id == project_id).count()
        code = f"TSK-{count + 1:03d}"

        new_task = TaskItem(
            project_id=project_id,
            task_code=code,
            title=f"Engineering Implementation Task for {proj.name}",
            description=answer.strip(),
            status="To Do",
            priority="High",
            assignee=current_user.full_name or "Lead Engineer",
            due_date=None
        )
        db.add(new_task)
        db.flush()

        created_task = TaskSchema(
            id=new_task.id,
            project_id=new_task.project_id,
            task_code=new_task.task_code,
            title=new_task.title,
            description=new_task.description,
            status=new_task.status,
            priority=new_task.priority,
            assignee=new_task.assignee,
            due_date=new_task.due_date,
            created_at=new_task.created_at.isoformat()
        )

    return {
        "project_id": project_id,
        "generated_text": answer,
        "created_task": created_task
    }

