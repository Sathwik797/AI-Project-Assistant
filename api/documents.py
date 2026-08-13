from typing import List
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, status

from api.schemas import DocumentResponse, DocumentDetailResponse
from services.project_service import get_project
from services.document_service import (
    process_and_save_document,
    get_documents_by_project,
    get_document,
    delete_document
)
from services.rag_ingestion_service import (
    get_document_index_status,
    index_document,
    ensure_project_documents_indexed
)
from services.vector_store_service import delete_document_chunks

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Documents"])


class FastAPIFileAdapter:
    def __init__(self, upload_file: UploadFile, content: bytes):
        self.name = upload_file.filename
        self._content = content

    def getvalue(self) -> bytes:
        return self._content


@router.get("/projects/{project_id}/documents", response_model=List[DocumentResponse])
def list_project_documents(project_id: int):
    """Retrieves all documents for a project including real-time vector index status."""
    proj = get_project(project_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )

    # Ensure all documents for this project are indexed in ChromaDB
    ensure_project_documents_indexed(project_id)

    docs = get_documents_by_project(project_id)
    response_list = []
    for d in docs:
        idx_status = get_document_index_status(d.id)
        response_list.append(DocumentResponse(
            id=d.id,
            project_id=d.project_id,
            filename=d.filename,
            file_type=d.file_type,
            file_size=d.file_size,
            created_at=d.created_at,
            is_indexed=idx_status["is_indexed"],
            chunk_count=idx_status["chunk_count"]
        ))
    return response_list


@router.post("/projects/{project_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(project_id: int, file: UploadFile = File(...)):
    """
    Uploads and processes a project document (PDF, DOCX, TXT up to 15 MB).
    Extracts raw text, saves metadata to MySQL, and auto-indexes into ChromaDB.
    """
    proj = get_project(project_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty."
        )

    try:
        content = await file.read()
    except Exception as read_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file stream: {read_err}"
        )

    adapter = FastAPIFileAdapter(file, content)
    ok, msg, new_doc = process_and_save_document(project_id, adapter)
    
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    # Automatically index document into ChromaDB upon upload
    if new_doc and new_doc.raw_text and new_doc.raw_text.strip():
        try:
            idx_ok, idx_msg, _ = index_document(new_doc.id)
            if idx_ok:
                logger.info(f"Auto-indexed document ID {new_doc.id} ({new_doc.filename}) on upload.")
        except Exception as idx_err:
            logger.error(f"Auto-indexing warning for document ID {new_doc.id}: {idx_err}")

    idx_status = get_document_index_status(new_doc.id)

    return DocumentResponse(
        id=new_doc.id,
        project_id=new_doc.project_id,
        filename=new_doc.filename,
        file_type=new_doc.file_type,
        file_size=new_doc.file_size,
        created_at=new_doc.created_at,
        is_indexed=idx_status["is_indexed"],
        chunk_count=idx_status["chunk_count"]
    )


@router.get("/documents/{document_id}", response_model=DocumentDetailResponse)
def get_document_detail(document_id: int):
    """Retrieves document detail including extracted raw text and indexing status."""
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    idx_status = get_document_index_status(doc.id)

    return DocumentDetailResponse(
        id=doc.id,
        project_id=doc.project_id,
        filename=doc.filename,
        file_path=doc.file_path,
        file_type=doc.file_type,
        file_size=doc.file_size,
        raw_text=doc.raw_text,
        created_at=doc.created_at,
        is_indexed=idx_status["is_indexed"],
        chunk_count=idx_status["chunk_count"]
    )


@router.delete("/documents/{document_id}")
def delete_project_document(document_id: int):
    """Deletes physical file, MySQL database record, and ChromaDB vector embeddings for a document."""
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    # Clean up ChromaDB vectors
    delete_document_chunks(document_id)

    # Delete MySQL record and physical file
    ok, msg = delete_document(document_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=msg
        )

    return {"success": True, "message": msg}
