import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings

logger = logging.getLogger(__name__)

CHROMA_PERSIST_DIR = "chroma_db"
COLLECTION_NAME = "project_documents"

_client_instance = None
_collection_instance = None


def get_chroma_client(persist_dir: str = CHROMA_PERSIST_DIR) -> chromadb.PersistentClient:
    """
    Returns a persistent ChromaDB client instance.
    """
    global _client_instance
    if _client_instance is None:
        abs_path = os.path.abspath(persist_dir)
        os.makedirs(abs_path, exist_ok=True)
        _client_instance = chromadb.PersistentClient(path=abs_path)
        logger.info(f"ChromaDB client initialized at {abs_path}")
    return _client_instance


def get_collection(collection_name: str = COLLECTION_NAME):
    """
    Retrieves or creates the target ChromaDB collection.
    """
    global _collection_instance
    if _collection_instance is None:
        client = get_chroma_client()
        _collection_instance = client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "Project documents chunk vector index"}
        )
    return _collection_instance


def delete_document_chunks(document_id: int) -> int:
    """
    Deletes all existing vectors in ChromaDB belonging to a specific document_id.
    Prevents duplicate vectors on re-indexing.
    """
    try:
        collection = get_collection()
        # Query existing IDs for the document
        existing = collection.get(
            where={"document_id": document_id}
        )
        if existing and existing.get("ids"):
            ids_to_delete = existing["ids"]
            collection.delete(ids=ids_to_delete)
            logger.info(f"Deleted {len(ids_to_delete)} existing vectors for document_id={document_id}")
            return len(ids_to_delete)
        return 0
    except Exception as e:
        logger.error(f"Error deleting chunks for document_id={document_id}: {e}")
        return 0


def add_document_chunks(
    project_id: int,
    document_id: int,
    filename: str,
    chunks: List[Dict[str, Any]],
    embeddings: List[List[float]]
) -> bool:
    """
    Upserts document chunks, embeddings, and metadata into ChromaDB.
    """
    if not chunks or not embeddings or len(chunks) != len(embeddings):
        logger.error("Chunks and embeddings length mismatch or empty.")
        return False

    collection = get_collection()

    # Clear prior embeddings for clean re-indexing
    delete_document_chunks(document_id)

    ids = []
    documents = []
    metadatas = []

    for chunk, embedding in zip(chunks, embeddings):
        chunk_idx = chunk["chunk_index"]
        # Deterministic ID format
        chunk_id = f"project_{project_id}_document_{document_id}_chunk_{chunk_idx}"
        
        ids.append(chunk_id)
        documents.append(chunk["chunk_text"])
        metadatas.append({
            "project_id": project_id,
            "document_id": document_id,
            "filename": filename,
            "chunk_index": chunk_idx
        })

    try:
        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        logger.info(f"Successfully indexed {len(ids)} chunks for document_id={document_id} in ChromaDB.")
        return True
    except Exception as e:
        logger.error(f"Error upserting vectors to ChromaDB: {e}")
        return False


def query_similar_chunks(
    project_id: int,
    query_embedding: List[float],
    n_results: int = 3
) -> List[Dict[str, Any]]:
    """
    Performs vector similarity search filtered strictly by project_id to enforce project isolation.
    """
    if not query_embedding:
        return []

    collection = get_collection()
    try:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where={"project_id": project_id}
        )

        formatted_results = []
        if results and results.get("documents") and results["documents"][0]:
            docs = results["documents"][0]
            metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)
            ids = results["ids"][0] if results.get("ids") else [""] * len(docs)

            for doc_text, meta, dist, cid in zip(docs, metadatas, distances, ids):
                formatted_results.append({
                    "id": cid,
                    "project_id": meta.get("project_id"),
                    "document_id": meta.get("document_id"),
                    "filename": meta.get("filename"),
                    "chunk_index": meta.get("chunk_index"),
                    "chunk_text": doc_text,
                    "distance": dist
                })

        return formatted_results
    except Exception as e:
        logger.error(f"Error querying ChromaDB for project_id={project_id}: {e}")
        return []


def get_document_chunk_count(document_id: int) -> int:
    """
    Returns the number of indexed vectors for a specific document_id.
    """
    try:
        collection = get_collection()
        res = collection.get(where={"document_id": document_id})
        return len(res["ids"]) if res and res.get("ids") else 0
    except Exception as e:
        logger.error(f"Error checking chunk count for document_id={document_id}: {e}")
        return 0


def get_total_vector_count() -> int:
    """
    Returns total count of vectors stored in ChromaDB collection.
    """
    try:
        collection = get_collection()
        return collection.count()
    except Exception as e:
        logger.error(f"Error getting ChromaDB count: {e}")
        return 0
