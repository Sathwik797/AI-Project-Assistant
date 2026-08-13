import logging
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

DEFAULT_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model_instance = None


def get_embedding_model(model_name: str = DEFAULT_MODEL_NAME) -> SentenceTransformer:
    """
    Lazy loader singleton for the SentenceTransformer model.
    Ensures model is downloaded/loaded into memory only once.
    """
    global _model_instance
    if _model_instance is None:
        logger.info(f"Loading SentenceTransformer model: {model_name}...")
        _model_instance = SentenceTransformer(model_name)
        logger.info("SentenceTransformer model loaded successfully.")
    return _model_instance


def embed_texts(texts: List[str], model_name: str = DEFAULT_MODEL_NAME) -> List[List[float]]:
    """
    Generates embedding vectors for a list of text strings.
    
    Returns:
        List of float vectors (dimension 384 for all-MiniLM-L6-v2).
    """
    if not texts:
        return []

    model = get_embedding_model(model_name)
    embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.tolist()


def embed_query(query: str, model_name: str = DEFAULT_MODEL_NAME) -> List[float]:
    """
    Generates an embedding vector for a single search query string.
    """
    if not query or not query.strip():
        return []

    model = get_embedding_model(model_name)
    embedding = model.encode(query.strip(), show_progress_bar=False, convert_to_numpy=True)
    return embedding.tolist()


def get_embedding_dimension(model_name: str = DEFAULT_MODEL_NAME) -> int:
    """
    Returns the vector dimension size (384 for all-MiniLM-L6-v2).
    """
    model = get_embedding_model(model_name)
    if hasattr(model, "get_embedding_dimension"):
        return model.get_embedding_dimension()
    return model.get_sentence_embedding_dimension()

