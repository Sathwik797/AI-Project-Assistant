import logging
from typing import Dict, Any, Tuple, Optional, List

from services.document_service import get_document, get_documents_by_project
from services.chunking_service import chunk_document_text
from services.embedding_service import embed_texts, embed_query
from services.vector_store_service import (
    add_document_chunks,
    get_document_chunk_count,
    query_similar_chunks,
    delete_document_chunks,
    get_collection
)

logger = logging.getLogger(__name__)


def index_document(
    document_id: int,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Complete RAG document ingestion pipeline:
    1. Fetches Document from MySQL.
    2. Verifies raw_text exists.
    3. Chunks raw_text recursively.
    4. Generates embeddings locally using SentenceTransformers.
    5. Stores/Upserts vectors into ChromaDB with metadata.
    
    Returns:
        (success: bool, message: str, index_info: dict)
    """
    doc = get_document(document_id)
    if not doc:
        return False, f"Document with ID {document_id} not found in database.", {}

    if not doc.raw_text or not doc.raw_text.strip():
        return False, f"Document '{doc.filename}' contains no extracted text to index.", {
            "document_id": document_id,
            "project_id": doc.project_id,
            "filename": doc.filename,
            "chunk_count": 0,
            "status": "empty_text"
        }

    # Step 1: Chunk text
    chunks = chunk_document_text(doc.raw_text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    if not chunks:
        return False, "Failed to create text chunks from document content.", {}

    chunk_texts = [c["chunk_text"] for c in chunks]

    # Step 2: Generate embeddings
    try:
        embeddings = embed_texts(chunk_texts)
    except Exception as e:
        logger.error(f"Embedding generation failed for document {document_id}: {e}")
        return False, f"Embedding generation failed: {e}", {}

    # Step 3: Upsert into ChromaDB
    saved = add_document_chunks(
        project_id=doc.project_id,
        document_id=doc.id,
        filename=doc.filename,
        chunks=chunks,
        embeddings=embeddings
    )

    if not saved:
        return False, "Failed to store vectors in ChromaDB.", {}

    result_info = {
        "document_id": doc.id,
        "project_id": doc.project_id,
        "filename": doc.filename,
        "chunk_count": len(chunks),
        "embedding_dim": len(embeddings[0]) if embeddings else 0,
        "status": "indexed"
    }

    return True, f"Document '{doc.filename}' indexed successfully into ChromaDB ({len(chunks)} chunks).", result_info


def ensure_project_documents_indexed(project_id: int) -> int:
    """
    Scans MySQL documents for a project and auto-indexes any document 
    that has extracted raw_text but 0 vector chunks in ChromaDB.
    Returns count of newly indexed documents.
    """
    docs = get_documents_by_project(project_id)
    indexed_count = 0

    for doc in docs:
        if doc.raw_text and doc.raw_text.strip():
            chunk_cnt = get_document_chunk_count(doc.id)
            if chunk_cnt == 0:
                logger.info(f"Auto-indexing unindexed document ID {doc.id} ({doc.filename}) for project {project_id}")
                ok, _, _ = index_document(doc.id)
                if ok:
                    indexed_count += 1

    return indexed_count


def get_document_index_status(document_id: int) -> Dict[str, Any]:
    """
    Checks ChromaDB vector count for a document.
    """
    count = get_document_chunk_count(document_id)
    return {
        "document_id": document_id,
        "is_indexed": count > 0,
        "chunk_count": count
    }


def get_all_project_chunks(project_id: int, limit: int = 25) -> List[Dict[str, Any]]:
    """
    Retrieves all vector chunks for a project directly from ChromaDB without query embedding filtering.
    Used for broad project summaries / overviews.
    """
    try:
        collection = get_collection()
        res = collection.get(
            where={"project_id": project_id},
            limit=limit
        )

        formatted = []
        if res and res.get("documents"):
            docs = res["documents"]
            metas = res.get("metadatas", [{}] * len(docs))
            ids = res.get("ids", [""] * len(docs))

            for doc_text, meta, cid in zip(docs, metas, ids):
                formatted.append({
                    "id": cid,
                    "project_id": meta.get("project_id"),
                    "document_id": meta.get("document_id"),
                    "filename": meta.get("filename", "Document"),
                    "chunk_index": meta.get("chunk_index", 0),
                    "chunk_text": doc_text,
                    "distance": 0.1
                })

        return formatted
    except Exception as e:
        logger.error(f"Error fetching all project chunks for project {project_id}: {e}")
        return []


def get_chunks_by_filename(project_id: int, filename_query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Retrieves chunks belonging to a specific document filename for targeted document-level summarization.
    """
    try:
        collection = get_collection()
        # Get all chunks for project and filter by filename pattern
        all_chunks = get_all_project_chunks(project_id, limit=50)
        matched = []
        fn_clean = filename_query.lower().strip()

        for c in all_chunks:
            chunk_fn = (c.get("filename") or "").lower()
            if fn_clean in chunk_fn or chunk_fn in fn_clean:
                matched.append(c)

        return matched[:limit]
    except Exception as e:
        logger.error(f"Error fetching chunks for filename {filename_query}: {e}")
        return []


def search_project_documents(
    project_id: int,
    query: str,
    top_k: int = 6
) -> List[Dict[str, Any]]:
    """
    Performs semantic vector search over indexed chunks for a given project.
    Ensures unindexed project documents are auto-indexed first.
    """
    if not query or not query.strip():
        return []

    # Ensure any unindexed docs for this project get auto-indexed
    ensure_project_documents_indexed(project_id)

    query_vector = embed_query(query)
    if not query_vector:
        return []

    return query_similar_chunks(
        project_id=project_id,
        query_embedding=query_vector,
        n_results=top_k
    )
