import os
import uuid
import logging
from typing import Optional, List, Tuple
from pypdf import PdfReader
from docx import Document as DocxDocument
from sqlalchemy.exc import SQLAlchemyError

from services.database import get_db_session
from services.models import Document, Project

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
UPLOAD_DIR = "uploads"


def validate_file(filename: str, file_size: int) -> Tuple[bool, str, str]:
    """
    Validates file extension and size.
    
    Returns:
        (is_valid: bool, file_type: str, error_message: str)
    """
    if not filename or "." not in filename:
        return False, "", "Invalid filename. File must have a valid extension (.pdf, .docx, .txt)."

    file_ext = filename.rsplit(".", 1)[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, "", f"Unsupported file type '.{file_ext}'. Supported formats: PDF, DOCX, TXT."

    if file_size > MAX_FILE_SIZE_BYTES:
        size_mb = file_size / (1024 * 1024)
        return False, file_ext, f"File size ({size_mb:.2f} MB) exceeds maximum allowed limit of 15 MB."

    return True, file_ext, ""


def extract_pdf_text(file_path: str) -> str:
    """Extracts raw text from a PDF document using PyPDF."""
    reader = PdfReader(file_path)
    text_pages = []
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            text_pages.append(page_text.strip())
    return "\n\n".join(text_pages)


def extract_docx_text(file_path: str) -> str:
    """Extracts raw text from a DOCX document using python-docx."""
    doc = DocxDocument(file_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
    return "\n\n".join(paragraphs)


def extract_txt_text(file_path: str) -> str:
    """Extracts raw text from a plain text file."""
    encodings = ["utf-8", "utf-8-sig", "latin-1"]
    for enc in encodings:
        try:
            with open(file_path, "r", encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def extract_text(file_path: str, file_type: str) -> str:
    """
    Higher-level text extraction dispatcher.
    """
    file_type = file_type.lower()
    if file_type == "pdf":
        return extract_pdf_text(file_path)
    elif file_type == "docx":
        return extract_docx_text(file_path)
    elif file_type == "txt":
        return extract_txt_text(file_path)
    else:
        raise ValueError(f"Unsupported file type for text extraction: {file_type}")


def process_and_save_document(
    project_id: int,
    uploaded_file,
    target_dir: str = UPLOAD_DIR
) -> Tuple[bool, str, Optional[Document]]:
    """
    Full pipeline to process an uploaded document:
    1. Validates project existence.
    2. Validates file type and size.
    3. Saves physical file to uploads/ with a UUID-based safe filename.
    4. Extracts text.
    5. Saves Document metadata and extracted text to MySQL.
    6. Cleans up physical file on failure.
    """
    # Read file properties
    original_filename = os.path.basename(uploaded_file.name)
    file_bytes = uploaded_file.getvalue()
    file_size = len(file_bytes)

    # Validate file format and size
    is_valid, file_type, val_error = validate_file(original_filename, file_size)
    if not is_valid:
        return False, val_error, None

    # Check project existence
    try:
        with get_db_session() as db:
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project:
                return False, f"Project with ID {project_id} does not exist.", None
    except SQLAlchemyError as e:
        logger.error(f"Database error verifying project: {e}")
        return False, "Database error verifying project existence.", None

    # Ensure uploads directory exists
    os.makedirs(target_dir, exist_ok=True)

    # Generate safe unique filename to prevent path traversal & collisions
    safe_filename = f"{uuid.uuid4().hex}.{file_type}"
    physical_file_path = os.path.abspath(os.path.join(target_dir, safe_filename))

    # Save physical file
    try:
        with open(physical_file_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        logger.error(f"Error saving physical file {physical_file_path}: {e}")
        return False, "Failed to save file to physical storage.", None

    # Extract text and insert into database
    try:
        extracted_text = extract_text(physical_file_path, file_type)

        with get_db_session() as db:
            new_doc = Document(
                project_id=project_id,
                filename=original_filename,
                file_path=physical_file_path,
                file_type=file_type,
                file_size=file_size,
                raw_text=extracted_text
            )
            db.add(new_doc)
            db.flush()
            db.refresh(new_doc)
            doc_id = new_doc.id
            doc_created_at = new_doc.created_at

        detached_doc = Document(
            id=doc_id,
            project_id=project_id,
            filename=original_filename,
            file_path=physical_file_path,
            file_type=file_type,
            file_size=file_size,
            raw_text=extracted_text,
            created_at=doc_created_at
        )

        return True, "Document uploaded and processed successfully.", detached_doc

    except Exception as e:
        logger.error(f"Processing failed for {original_filename}: {e}")
        # Clean up physical file if created
        if os.path.exists(physical_file_path):
            try:
                os.remove(physical_file_path)
            except Exception as cleanup_err:
                logger.error(f"Error removing physical file during cleanup: {cleanup_err}")

        return False, "Failed to extract text or store document details.", None


def get_documents_by_project(project_id: int) -> List[Document]:
    """Retrieves all documents belonging to a given project."""
    try:
        with get_db_session() as db:
            docs = (
                db.query(Document)
                .filter(Document.project_id == project_id)
                .order_by(Document.created_at.desc())
                .all()
            )
            return [
                Document(
                    id=d.id,
                    project_id=d.project_id,
                    filename=d.filename,
                    file_path=d.file_path,
                    file_type=d.file_type,
                    file_size=d.file_size,
                    raw_text=d.raw_text,
                    created_at=d.created_at
                )
                for d in docs
            ]
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching documents for project {project_id}: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error fetching documents for project {project_id}: {e}")
        return []


def get_document(document_id: int) -> Optional[Document]:
    """Retrieves a single document by its ID."""
    try:
        with get_db_session() as db:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if not doc:
                return None
            return Document(
                id=doc.id,
                project_id=doc.project_id,
                filename=doc.filename,
                file_path=doc.file_path,
                file_type=doc.file_type,
                file_size=doc.file_size,
                raw_text=doc.raw_text,
                created_at=doc.created_at
            )
    except Exception as e:
        logger.error(f"Error fetching document {document_id}: {e}")
        return None


def delete_document(document_id: int) -> Tuple[bool, str]:
    """
    Deletes physical file and database record for a document.
    """
    try:
        with get_db_session() as db:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if not doc:
                return False, "Document not found."

            file_path = doc.file_path

            # Remove database record
            db.delete(doc)
            db.commit()

        # Delete physical file from disk
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as file_err:
                logger.error(f"Failed to delete physical file {file_path}: {file_err}")

        return True, "Document deleted successfully."
    except SQLAlchemyError as e:
        logger.error(f"Database error deleting document {document_id}: {e}")
        return False, "Failed to delete document from database."
    except Exception as e:
        logger.error(f"Unexpected error deleting document {document_id}: {e}")
        return False, "An error occurred while deleting the document."
