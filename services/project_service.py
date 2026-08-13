import logging
from typing import Optional, List, Tuple
from sqlalchemy.exc import SQLAlchemyError
from services.database import get_db_session
from services.models import Project

logger = logging.getLogger(__name__)


def create_project(name: str, description: Optional[str] = None) -> Tuple[bool, str, Optional[Project]]:
    """
    Creates a new project record in the database.
    
    Validation:
    - Name must not be empty or whitespace only.
    - Name must be 100 characters or fewer.
    
    Returns:
        (success: bool, message: str, project: Project | None)
    """
    if not name or not name.strip():
        return False, "Project name cannot be empty.", None

    name = name.strip()
    if len(name) > 100:
        return False, "Project name must be 100 characters or fewer.", None

    clean_description = description.strip() if description and description.strip() else None

    try:
        with get_db_session() as db:
            new_project = Project(name=name, description=clean_description)
            db.add(new_project)
            db.flush()
            db.refresh(new_project)
            # Access attributes before session closes to detach cleanly
            project_id = new_project.id
            project_name = new_project.name
            project_desc = new_project.description
            created_at = new_project.created_at
            updated_at = new_project.updated_at
            
        detached_project = Project(
            id=project_id,
            name=project_name,
            description=project_desc,
            created_at=created_at,
            updated_at=updated_at
        )
        return True, "Project created successfully.", detached_project
    except SQLAlchemyError as e:
        logger.error(f"Database error creating project: {e}")
        return False, "Failed to create project due to a database error.", None
    except Exception as e:
        logger.error(f"Unexpected error creating project: {e}")
        return False, "An unexpected error occurred while creating the project.", None


def get_projects() -> List[Project]:
    """
    Retrieves all projects ordered by creation date descending.
    """
    try:
        with get_db_session() as db:
            projects = db.query(Project).order_by(Project.created_at.desc()).all()
            # Construct detached copies for safe usage in UI
            detached_list = [
                Project(
                    id=p.id,
                    name=p.name,
                    description=p.description,
                    created_at=p.created_at,
                    updated_at=p.updated_at
                )
                for p in projects
            ]
            return detached_list
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching projects: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error fetching projects: {e}")
        return []


def get_project(project_id: int) -> Optional[Project]:
    """
    Retrieves a single project by its ID.
    """
    if not isinstance(project_id, int) or project_id <= 0:
        return None

    try:
        with get_db_session() as db:
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project:
                return None
            return Project(
                id=project.id,
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
