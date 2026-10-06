from typing import List
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, status, Depends

from api.schemas import DocumentResponse, DocumentDetailResponse, QuestionRequest, QuestionResponse, SourceResponse
from api.auth import get_current_user_from_token, verify_project_ownership, UserResponse
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
from services.ai_service import generate_answer_with_gemini

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Documents"])


class FastAPIFileAdapter:
    def __init__(self, upload_file: UploadFile, content: bytes):
        self.name = upload_file.filename
        self._content = content

    def getvalue(self) -> bytes:
        return self._content


@router.get("/projects/{project_id}/documents", response_model=List[DocumentResponse])
def list_project_documents(project_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    """Retrieves all documents for a project including real-time vector index status."""
    verify_project_ownership(project_id, current_user)

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
async def upload_document(project_id: int, file: UploadFile = File(...), current_user: UserResponse = Depends(get_current_user_from_token)):
    """
    Uploads and processes a project document (PDF, DOCX, TXT up to 15 MB).
    Extracts raw text, saves metadata to MySQL, and auto-indexes into ChromaDB.
    """
    verify_project_ownership(project_id, current_user)

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty."
        )

    max_file_size = 15 * 1024 * 1024
    if file.size is not None and file.size > max_file_size:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds the 15 MB upload limit.")

    try:
        content = await file.read(max_file_size + 1)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to read uploaded file.")
    if len(content) > max_file_size:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds the 15 MB upload limit.")

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
def get_document_detail(document_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    """Retrieves document detail including extracted raw text and indexing status."""
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )
    verify_project_ownership(doc.project_id, current_user)

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
def delete_project_document(document_id: int, current_user: UserResponse = Depends(get_current_user_from_token)):
    """Deletes physical file, MySQL database record, and ChromaDB vector embeddings for a document."""
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )
    verify_project_ownership(doc.project_id, current_user)

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


@router.post("/documents/{document_id}/chat", response_model=QuestionResponse)
def chat_with_document(document_id: int, payload: QuestionRequest, current_user: UserResponse = Depends(get_current_user_from_token)):
    """
    Document AI Copilot Endpoint:
    Directly analyzes the selected document's extracted raw text using Gemini.
    Provides accurate, grounded document summarization and targeted question answering.
    """
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )
    verify_project_ownership(doc.project_id, current_user)

    if not payload.question or not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question text cannot be empty."
        )

    raw_text = doc.raw_text or ""
    if not raw_text.strip():
        return QuestionResponse(
            success=False,
            error=f"Document '{doc.filename}' contains no readable text content.",
            has_context=False,
            sources=[]
        )

    # Send document content directly to Gemini with strict document-grounding system prompt
    context_str = f"TARGET DOCUMENT FILENAME: {doc.filename}\nFILE TYPE: {doc.file_type.upper()}\n\nFULL DOCUMENT TEXT:\n{raw_text[:35000]}"
    
    success, llm_answer = generate_answer_with_gemini(
        question=payload.question.strip(),
        context_str=context_str,
        intent_type="DOCUMENT_SUMMARY"
    )

    if not success:
        return QuestionResponse(
            success=False,
            error=llm_answer,
            has_context=False,
            sources=[]
        )

    source = SourceResponse(
        filename=doc.filename,
        chunk_index=0,
        distance=0.0,
        chunk_text=raw_text[:300] + ("..." if len(raw_text) > 300 else "")
    )

    return QuestionResponse(
        success=True,
        answer=llm_answer,
        has_context=True,
        sources=[source],
        error=None
    )

