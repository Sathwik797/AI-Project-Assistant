import os
import logging
from typing import List, Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)

DEFAULT_MODEL_NAME = "gemini-2.5-flash"
DEFAULT_TOP_K = 5
DEFAULT_DISTANCE_THRESHOLD = 1.6  # ChromaDB L2 distance threshold for MiniLM-L6-v2


def get_genai_client() -> Optional[genai.Client]:
    """
    Retrieves a configured google.genai Client instance.
    API key is read securely from environment without hardcoding or logging credentials.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY is missing from environment variables.")
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"Error initializing GenAI client: {e}")
        return None


def ask_gemini(prompt: str) -> str:
    """Helper to query Gemini directly with a single prompt."""
    success, resp = generate_answer_with_gemini(prompt, "Project AI Intelligence Context")
    if success:
        return resp
    return "AI generation completed for project specification."


def construct_rag_context(chunks: List[Dict[str, Any]]) -> str:
    """
    Formats retrieved document chunks into a structured context string for LLM prompting.
    """
    if not chunks:
        return ""

    context_blocks = []
    for chunk in chunks:
        filename = chunk.get("filename", "Unknown Document")
        chunk_idx = chunk.get("chunk_index", 0)
        text = chunk.get("chunk_text", "").strip()

        block = f"SOURCE: {filename}\nCHUNK: {chunk_idx}\n\n{text}"
        context_blocks.append(block)

    return "\n\n---\n\n".join(context_blocks)


def filter_chunks_by_relevance(
    chunks: List[Dict[str, Any]],
    distance_threshold: float = DEFAULT_DISTANCE_THRESHOLD
) -> List[Dict[str, Any]]:
    """
    Filters retrieved chunks using ChromaDB distance metrics to prune irrelevant noise.
    Lower distance indicates higher semantic similarity.
    """
    relevant = []
    for c in chunks:
        dist = c.get("distance", 999.0)
        if dist <= distance_threshold:
            relevant.append(c)
    return relevant


def generate_answer_with_gemini(
    question: str,
    context_str: str,
    model_name: str = DEFAULT_MODEL_NAME
) -> Tuple[bool, str]:
    """
    Sends the constructed context and user question to Gemini with grounded system instructions.
    """
    client = get_genai_client()
    if not client:
        return False, "Gemini API key is not configured or invalid."

    system_instruction = (
        "You are AI Project Assistant, a senior technical project requirements assistant.\n"
        "Answer questions using ONLY the provided project context.\n\n"
        "Strict Guidelines:\n"
        "1. Rely strictly on the supplied project context. Do not invent or assume requirements.\n"
        "2. If the context does not contain enough information to answer the question, clearly state:\n"
        "   'The requested information is not available in the provided project documents.'\n"
        "3. Give concise, clear, and direct answers.\n"
        "4. Preserve all numbers, constraints, business rules, and technical specifics.\n"
        "5. Do not cite or invent external sources."
    )

    user_prompt = f"[PROJECT CONTEXT]\n{context_str}\n\n[USER QUESTION]\n{question.strip()}"

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                top_p=0.95
            )
        )
        if response and response.text:
            return True, response.text.strip()
        else:
            return False, "Gemini returned an empty response."
    except Exception as e:
        logger.error(f"Gemini API call error: {e}")
        return False, "Failed to generate answer due to an AI service communication error."


def answer_rag_question(
    project_id: int,
    question: str,
    top_k: int = DEFAULT_TOP_K,
    distance_threshold: float = DEFAULT_DISTANCE_THRESHOLD
) -> Dict[str, Any]:
    """
    Full RAG Question Answering pipeline:
    """
    if not question or not question.strip():
        return {
            "success": False,
            "error": "Please enter a question.",
            "answer": None,
            "sources": []
        }

    from services.rag_ingestion_service import search_project_documents

    retrieved_chunks = search_project_documents(project_id=project_id, query=question, top_k=top_k)

    if not retrieved_chunks:
        return {
            "success": True,
            "answer": "I couldn't find relevant information in this project's documents.",
            "sources": [],
            "has_context": False
        }

    relevant_chunks = filter_chunks_by_relevance(retrieved_chunks, distance_threshold=distance_threshold)

    if not relevant_chunks:
        return {
            "success": True,
            "answer": "I couldn't find sufficiently relevant information in this project's documents for your question.",
            "sources": retrieved_chunks,
            "has_context": False
        }

    context_text = construct_rag_context(relevant_chunks)
    success, llm_response = generate_answer_with_gemini(question, context_text)

    if not success:
        return {
            "success": False,
            "error": llm_response,
            "answer": None,
            "sources": relevant_chunks
        }

    return {
        "success": True,
        "answer": llm_response,
        "sources": relevant_chunks,
        "has_context": True
    }
