import logging
from typing import Optional, List, Tuple
from sqlalchemy.exc import SQLAlchemyError
from services.database import get_db_session
from services.models import Project

logger = logging.getLogger(__name__)


def create_project(name: str, description: Optional[str] = None, owner_id: int = 1) -> Tuple[bool, str, Optional[Project]]:
    if not name or not name.strip():
        return False, "Project name cannot be empty.", None

    name = name.strip()
    if len(name) > 100:
        return False, "Project name must be 100 characters or fewer.", None

    clean_description = description.strip() if description and description.strip() else None

    try:
        with get_db_session() as db:
            new_project = Project(name=name, description=clean_description, owner_id=owner_id)
            db.add(new_project)
            db.flush()
            db.refresh(new_project)
            
            detached_project = Project(
                id=new_project.id,
                owner_id=new_project.owner_id,
                name=new_project.name,
                description=new_project.description,
                created_at=new_project.created_at,
                updated_at=new_project.updated_at
            )
        return True, "Project created successfully.", detached_project
    except SQLAlchemyError as e:
        logger.error(f"Database error creating project: {e}")
        return False, "Failed to create project due to a database error.", None
    except Exception as e:
        logger.error(f"Unexpected error creating project: {e}")
        return False, "An unexpected error occurred while creating the project.", None


def get_projects(owner_id: Optional[int] = None) -> List[Project]:
    try:
        with get_db_session() as db:
            query = db.query(Project)
            if owner_id is not None:
                query = query.filter(Project.owner_id == owner_id)
            projects = query.order_by(Project.created_at.desc()).all()
            return [
                Project(
                    id=p.id,
                    owner_id=p.owner_id,
                    name=p.name,
                    description=p.description,
                    created_at=p.created_at,
                    updated_at=p.updated_at
                )
                for p in projects
            ]
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching projects: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error fetching projects: {e}")
        return []


def get_project(project_id: int, owner_id: Optional[int] = None) -> Optional[Project]:
    if not isinstance(project_id, int) or project_id <= 0:
        return None

    try:
        with get_db_session() as db:
            query = db.query(Project).filter(Project.id == project_id)
            if owner_id is not None:
                query = query.filter(Project.owner_id == owner_id)
            project = query.first()
            if not project:
                return None
            return Project(
                id=project.id,
                owner_id=project.owner_id,
                name=project.name,
                description=project.description,
                created_at=project.created_at,
                updated_at=project.updated_at
            )
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching project {project_id}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching project {project_id}: {e}")
        return None


def update_project(project_id: int, name: str, description: Optional[str] = None, owner_id: Optional[int] = None) -> Tuple[bool, str, Optional[Project]]:
    if not name or not name.strip():
        return False, "Project name cannot be empty.", None

    name = name.strip()
    clean_description = description.strip() if description and description.strip() else None

    try:
        with get_db_session() as db:
            query = db.query(Project).filter(Project.id == project_id)
            if owner_id is not None:
                query = query.filter(Project.owner_id == owner_id)
            project = query.first()
            if not project:
                return False, "Project not found.", None
            
            project.name = name
            project.description = clean_description
            db.flush()

            detached_project = Project(
                id=project.id,
                owner_id=project.owner_id,
                name=project.name,
                description=project.description,
                created_at=project.created_at,
                updated_at=project.updated_at
            )
        return True, "Project updated successfully.", detached_project
    except SQLAlchemyError as e:
        logger.error(f"Database error updating project {project_id}: {e}")
        return False, "Failed to update project due to database error.", None


def delete_project(project_id: int, owner_id: Optional[int] = None) -> Tuple[bool, str]:
    try:
        with get_db_session() as db:
            query = db.query(Project).filter(Project.id == project_id)
            if owner_id is not None:
                query = query.filter(Project.owner_id == owner_id)
            project = query.first()
            if not project:
                return False, "Project not found."
            
            db.delete(project)
        return True, "Project deleted successfully."
    except SQLAlchemyError as e:
        logger.error(f"Database error deleting project {project_id}: {e}")
        return False, "Failed to delete project due to database error."

