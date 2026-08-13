import os
import logging
import re
from typing import List, Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)

DEFAULT_MODEL_NAME = "gemini-2.5-flash"
DEFAULT_TOP_K = 6
DEFAULT_DISTANCE_THRESHOLD = 1.8


def get_genai_client() -> Optional[genai.Client]:
    """
    Retrieves a configured google.genai Client instance.
    API key is read securely from environment variables.
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


def ask_gemini(prompt: str, system_instruction: Optional[str] = None) -> str:
    """
    Direct helper method for generating content with Gemini 
    (used by requirements, user stories, tasks, and conflict analysis endpoints).
    """
    client = get_genai_client()
    if not client:
        return "Gemini API key is not configured."
    try:
        config = types.GenerateContentConfig(temperature=0.2)
        if system_instruction:
            config.system_instruction = system_instruction
            
        response = client.models.generate_content(
            model=DEFAULT_MODEL_NAME,
            contents=prompt,
            config=config
        )
        return response.text.strip() if response and response.text else "Empty response from Gemini."
    except Exception as e:
        logger.error(f"Error in ask_gemini: {e}")
        return f"Gemini service error: {e}"


def classify_user_intent(query: str, available_filenames: List[str]) -> Tuple[str, Optional[str]]:
    """
    Hybrid Intent Classifier:
    - Returns ('DOCUMENT_SUMMARY', filename) for specific or relative document requests (e.g. "summarize the above document").
    - Returns ('PROJECT_SUMMARY', None) for broad project overview requests.
    - Returns ('RAG_QUESTION', None) for standard conversational Q&A.
    """
    q_lower = query.lower().strip()

    # 1. Check for specific document mention by filename in query
    for fn in available_filenames:
        fn_clean = fn.lower().strip()
        base_fn = os.path.splitext(fn_clean)[0]
        if fn_clean in q_lower or (len(base_fn) > 3 and base_fn in q_lower):
            if any(w in q_lower for w in ["summarize", "summary", "explain", "analyze", "overview", "what is", "read"]):
                return "DOCUMENT_SUMMARY", fn

    # 2. Check for relative/generic document summary phrases ("summarize the above document", "summarize this document", etc.)
    generic_doc_phrases = [
        "summarize the above document", "summarize this document", "summarize the document",
        "summarize attached document", "summarize attached file", "summarize file",
        "summarize pdf", "summarize doc", "summarize the doc", "explain this document",
        "explain the document", "overview of this document", "overview of the document",
        "summarize above document", "summarize my document", "read this document"
    ]
    
    if any(phrase in q_lower for phrase in generic_doc_phrases):
        # Default to the most recently uploaded project document
        target_fn = available_filenames[0] if available_filenames else None
        return "DOCUMENT_SUMMARY", target_fn

    # 3. Check for broad project summary keywords
    summary_keywords = [
        "summarize the project", "summarize project", "summary of project",
        "project summary", "project overview", "brief", "about this project",
        "what is this project", "project scope", "main features", "key requirements",
        "explain the project", "list requirements", "system requirements"
    ]
    
    if any(kw in q_lower for kw in summary_keywords) or q_lower in ["summarize", "summary", "overview"]:
        return "PROJECT_SUMMARY", None

    return "RAG_QUESTION", None


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

        block = f"SOURCE DOCUMENT: {filename}\nCHUNK INDEX: #{chunk_idx}\n\n{text}"
        context_blocks.append(block)

    return "\n\n---\n\n".join(context_blocks)


def filter_chunks_by_relevance(
    chunks: List[Dict[str, Any]],
    distance_threshold: float = DEFAULT_DISTANCE_THRESHOLD
) -> List[Dict[str, Any]]:
    """
    Filters retrieved chunks using ChromaDB distance metrics to prune noise.
    """
    relevant = []
    for c in chunks:
        dist = c.get("distance", 999.0)
        if dist <= distance_threshold:
            relevant.append(c)
    return relevant if relevant else chunks[:3]


def generate_answer_with_gemini(
    question: str,
    context_str: str,
    intent_type: str = "RAG_QUESTION",
    model_name: str = DEFAULT_MODEL_NAME
) -> Tuple[bool, str]:
    """
    Sends constructed context and user question to Gemini with strict anti-hallucination rules.
    """
    client = get_genai_client()
    if not client:
        return False, "Gemini API key is not configured or invalid."

    if intent_type == "PROJECT_SUMMARY":
        system_instruction = (
            "You are AI Project Assistant, an expert software architecture and project requirements AI.\n"
            "The user is asking for an overall summary/overview of the project.\n\n"
            "STRICT GROUNDING & ANTI-HALLUCINATION RULES:\n"
            "1. Synthesize a structured project overview based EXCLUSIVELY on the provided [PROJECT DOCUMENT CONTEXT].\n"
            "2. Organize with headings: Project Purpose, Key Features & Scope, Important Requirements, and Technical Architecture.\n"
            "3. DO NOT invent, assume, or guess facts, technologies, databases, or features not in the documents.\n"
            "4. If a detail (such as database or framework) is not mentioned, state: 'The provided project documents do not specify this detail.'"
        )
    elif intent_type == "DOCUMENT_SUMMARY":
        system_instruction = (
            "You are AI Project Assistant, an expert software documentation AI.\n"
            "The user is asking for a summary of a project document.\n\n"
            "STRICT GROUNDING & ANTI-HALLUCINATION RULES:\n"
            "1. Synthesize a comprehensive summary based EXCLUSIVELY on the provided document chunks.\n"
            "2. Highlight key sections, specifications, and requirements contained in this document.\n"
            "3. DO NOT invent external facts or guess unmentioned details."
        )
    else:
        system_instruction = (
            "You are AI Project Assistant, a senior technical project requirements assistant.\n"
            "Answer questions using EXCLUSIVELY the provided project document context.\n\n"
            "STRICT ANTI-HALLUCINATION RULES:\n"
            "1. Rely strictly on the supplied project document context. Do not invent or assume requirements.\n"
            "2. If the context does NOT specify the requested fact (such as a database, language, or feature), clearly state:\n"
            "   'The provided project documents do not specify [topic/technology].'\n"
            "3. Give concise, clear, and direct answers.\n"
            "4. Preserve all numbers, constraints, business rules, and technical specifics.\n"
            "5. Do not cite or invent external sources."
        )

    user_prompt = f"[PROJECT DOCUMENT CONTEXT]\n{context_str}\n\n[USER QUESTION]\n{question.strip()}"

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.15,
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
    RAG + GEMINI HYBRID INTELLIGENCE PIPELINE:
    1. Validates document availability.
    2. Auto-indexes unindexed project documents in ChromaDB.
    3. Classifies query intent: PROJECT_SUMMARY, DOCUMENT_SUMMARY, or RAG_QUESTION.
    4. Retrieves appropriate document context (full-project, document-specific, or top-k vector search).
    5. Prompts Gemini with strict anti-hallucination constraints over actual document text.
    6. Returns grounded response with real source attributions.
    """
    if not question or not question.strip():
        return {
            "success": False,
            "error": "Please enter a question.",
            "answer": None,
            "sources": []
        }

    from services.rag_ingestion_service import (
        search_project_documents,
        get_all_project_chunks,
        get_chunks_by_filename,
        ensure_project_documents_indexed
    )
    from services.document_service import get_documents_by_project

    # Step 1: Document availability & auto-indexing
    docs = get_documents_by_project(project_id)
    if not docs:
        return {
            "success": True,
            "answer": "No project documents have been uploaded yet. Upload project documents in the Knowledge Base to ask grounded questions.",
            "sources": [],
            "has_context": False
        }

    ensure_project_documents_indexed(project_id)
    available_filenames = [d.filename for d in docs]

    # Step 2: Classify Intent
    intent_type, target_filename = classify_user_intent(question, available_filenames)

    # Step 3: Context Retrieval based on Intent
    if intent_type == "DOCUMENT_SUMMARY":
        if target_filename:
            retrieved_chunks = get_chunks_by_filename(project_id, target_filename, limit=20)
        else:
            retrieved_chunks = get_all_project_chunks(project_id, limit=20)
            
        if not retrieved_chunks:
            retrieved_chunks = search_project_documents(project_id=project_id, query=question, top_k=top_k)

    elif intent_type == "PROJECT_SUMMARY":
        retrieved_chunks = get_all_project_chunks(project_id, limit=20)
        if not retrieved_chunks:
            retrieved_chunks = search_project_documents(project_id=project_id, query=question, top_k=top_k)
    else:
        retrieved_chunks = search_project_documents(project_id=project_id, query=question, top_k=top_k)

    if not retrieved_chunks:
        return {
            "success": True,
            "answer": "Project documents are uploaded but contain no searchable text chunks.",
            "sources": [],
            "has_context": False
        }

    relevant_chunks = filter_chunks_by_relevance(retrieved_chunks, distance_threshold=distance_threshold)
    context_text = construct_rag_context(relevant_chunks)

    # Step 4: Hybrid Gemini Reasoning over actual document content
    success, llm_response = generate_answer_with_gemini(
        question=question,
        context_str=context_text,
        intent_type=intent_type
    )

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
