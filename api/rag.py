from fastapi import APIRouter, HTTPException, status
from api.schemas import QuestionRequest, QuestionResponse, IndexResponse, SourceResponse
from services.project_service import get_project
from services.document_service import get_document
from services.rag_ingestion_service import index_document
from services.ai_service import answer_rag_question

router = APIRouter(tags=["RAG & AI"])


@router.post("/documents/{document_id}/index", response_model=IndexResponse)
def index_project_document(document_id: int):
    """
    Indexes a document into ChromaDB:
    1. Fetches extracted raw text from MySQL.
    2. Chunks text recursively.
    3. Generates vector embeddings locally.
    4. Upserts vectors into ChromaDB.
    """
    doc = get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    ok, msg, info = index_document(document_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    return IndexResponse(
        success=True,
        message=msg,
        index_info=info
    )


@router.post("/projects/{project_id}/ask", response_model=QuestionResponse)
def ask_project_rag_question(project_id: int, payload: QuestionRequest):
    """
    Full RAG Question Answering Endpoint:
    1. Validates project existence.
    2. Performs project-isolated vector similarity search in ChromaDB.
    3. Filters chunks by relevance threshold.
    4. Calls Gemini 2.5 Flash for grounded answer generation.
    5. Returns grounded answer with source citations.
    """
    proj = get_project(project_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )

    if not payload.question or not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question text cannot be empty."
        )

    top_k = payload.top_k if payload.top_k else 5
    result = answer_rag_question(project_id, payload.question.strip(), top_k=top_k)

    if not result.get("success"):
        return QuestionResponse(
            success=False,
            error=result.get("error", "Failed to generate answer."),
            has_context=False,
            sources=[]
        )

    formatted_sources = []
    for src in result.get("sources", []):
        formatted_sources.append(SourceResponse(
            filename=src.get("filename", "Unknown"),
            chunk_index=src.get("chunk_index", 0),
            distance=float(src.get("distance", 0.0)),
            chunk_text=src.get("chunk_text", "")
        ))

    return QuestionResponse(
        success=True,
        answer=result.get("answer"),
        has_context=result.get("has_context", True),
        sources=formatted_sources,
        error=None
    )
