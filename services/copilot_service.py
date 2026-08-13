import os
import base64
import logging
from typing import List, Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

from services.database import get_db_session
from services.models import Project, Document, Requirement, UserStory, TaskItem, RequirementConflict
from services.ai_service import get_genai_client, DEFAULT_MODEL_NAME

load_dotenv()
logger = logging.getLogger(__name__)

# Structured Application Context for Main Copilot
APPLICATION_CONTEXT = """
APPLICATION:
AI Project Assistant

PURPOSE:
AI-powered project intelligence and engineering workflow platform designed to streamline software project management from initial requirements to development tasks.

CORE MODULES & FEATURES:
1. Overview: Project dashboard displaying document counts, indexed document status, total storage used, and high-level project metrics.
2. Documents: Knowledge base workspace where users upload (PDF, DOCX, TXT max 15MB), inspect, and index project specification files into vector storage. Contains the Document Reader and dedicated Document AI Copilot for grounded document analysis.
3. Requirements: Requirement analysis workspace supporting manual requirement creation, automated requirement extraction, acceptance criteria definition, and AI specification generation.
4. User Stories: Agile user story management workspace featuring REQ code traceability, role-goal-benefit formatting, acceptance criteria, and automated AI story generation.
5. Tasks: Technical development task workspace for breaking down user stories into engineering tasks categorized by task type (Frontend, Backend, Database, API, Security, Testing), task priority, and sprint effort estimates.
6. Conflicts: Automated quality & compliance workspace that scans project specifications to detect contradictions, ambiguities, and requirement conflicts with resolution recommendations.
7. Settings / Profile: User role configuration (Product Manager, Lead Architect, Developer, QA Engineer) and account settings.

CORE WORKFLOW:
Documents (Upload & Index) -> Requirements (Define & Extract) -> User Stories (Agile Breakdown) -> Tasks (Engineering Execution) -> Conflicts (Quality Audit)
"""

MAIN_COPILOT_SYSTEM_INSTRUCTION = """
You are the AI Project Assistant Copilot, an expert product and project management AI assistant embedded in the AI Project Assistant SaaS platform.

YOUR PRIMARY RESPONSIBILITY:
Help users understand and operate the AI Project Assistant application, navigate workflows, troubleshoot issues, and provide general software project management, software architecture, and agile engineering guidance.

STRICT OPERATIONAL GUIDELINES:
1. Focus on product assistance, workflow guidance, agile user story writing, requirement structuring, technical task breakdown, and project troubleshooting.
2. Use the provided Application Context, Current UI Page Context, User Role, and Real-time Project Database Metadata when answering.
3. Do NOT invent application features, APIs, buttons, or workflows that are not part of the provided application context.
4. If asked how many requirements, user stories, tasks, or documents exist, rely strictly on the provided REAL-TIME PROJECT METADATA.
5. If the user asks a question specifically about the contents of an uploaded project document (such as "Summarize architecture.pdf" or "What does the spec say about authentication?"), clearly explain that document-grounded questions should be directed to the Document AI Copilot inside the Document Reader.
6. Provide helpful, concise, and professional responses formatted in clean markdown.
"""


def get_project_metadata(project_id: int) -> Dict[str, Any]:
    """
    Retrieves real-time database counts and metadata for the project without performing vector RAG.
    """
    metadata = {
        "project_name": None,
        "project_description": None,
        "document_count": 0,
        "indexed_document_count": 0,
        "filenames": [],
        "requirement_count": 0,
        "user_story_count": 0,
        "task_count": 0,
        "completed_task_count": 0,
        "conflict_count": 0,
    }

    try:
        with get_db_session() as db:
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project:
                return metadata
            
            metadata["project_name"] = project.name
            metadata["project_description"] = project.description

            docs = db.query(Document).filter(Document.project_id == project_id).all()
            metadata["document_count"] = len(docs)
            metadata["filenames"] = [d.filename for d in docs]
            
            from services.rag_ingestion_service import get_document_index_status
            indexed_cnt = 0
            for d in docs:
                status = get_document_index_status(d.id)
                if status.get("is_indexed"):
                    indexed_cnt += 1
            metadata["indexed_document_count"] = indexed_cnt

            metadata["requirement_count"] = db.query(Requirement).filter(Requirement.project_id == project_id).count()
            metadata["user_story_count"] = db.query(UserStory).filter(UserStory.project_id == project_id).count()
            
            tasks = db.query(TaskItem).filter(TaskItem.project_id == project_id).all()
            metadata["task_count"] = len(tasks)
            metadata["completed_task_count"] = sum(1 for t in tasks if str(t.status).lower() in ["completed", "done"])

            metadata["conflict_count"] = db.query(RequirementConflict).filter(RequirementConflict.project_id == project_id).count()
    except Exception as e:
        logger.error(f"Error fetching project metadata for project {project_id}: {e}")

    return metadata


def classify_copilot_intent(message: str, available_filenames: List[str]) -> Tuple[str, Optional[str]]:
    """
    Classifies the user's message intent to determine routing:
    - DOCUMENT_SPECIFIC: Requests referring to specific uploaded document content.
    - PROJECT_METADATA: Questions about artifact counts or project status.
    - APPLICATION_TROUBLESHOOTING: App error or workflow issue help.
    - COPILOT_HELP: Questions about how to use the app or specific buttons/modules.
    - EXPLICIT_DOCUMENT_ANALYSIS: Explicit user request to run a project-wide document audit.
    - GENERAL_COPILOT: Product management, Agile, or general software engineering advice.
    """
    msg_lower = message.lower().strip()

    # 1. Explicit document analysis across all project documents
    if any(phrase in msg_lower for phrase in ["analyze all project documents", "scan all documents for contradictions", "audit all specs"]):
        return "EXPLICIT_DOCUMENT_ANALYSIS", None

    # 2. Check if specific document is mentioned by filename or document inquiry
    for fn in available_filenames:
        fn_lower = fn.lower().strip()
        base_fn = os.path.splitext(fn_lower)[0]
        if fn_lower in msg_lower or (len(base_fn) > 3 and base_fn in msg_lower):
            if any(w in msg_lower for w in ["summarize", "summary", "read", "extract", "what does", "say about", "in this file", "in this document", "according to"]):
                return "DOCUMENT_SPECIFIC", fn

    doc_inquiry_phrases = [
        "summarize the uploaded document", "summarize requirements.pdf", "summarize architecture.pdf",
        "what does the architecture document say", "what does the spec say", "in the uploaded pdf",
        "according to the document", "read the document"
    ]
    for phrase in doc_inquiry_phrases:
        if phrase in msg_lower:
            target_fn = available_filenames[0] if available_filenames else "uploaded document"
            return "DOCUMENT_SPECIFIC", target_fn

    # 3. Project Metadata / Counts
    metadata_phrases = [
        "how many requirements", "how many user stories", "how many tasks", "how many documents",
        "how many conflicts", "project stats", "project status", "count of requirements", "how many items"
    ]
    if any(p in msg_lower for p in metadata_phrases):
        return "PROJECT_METADATA", None

    # 4. Application Troubleshooting
    trouble_phrases = [
        "pending index", "stuck", "error", "failed to index", "not working", "cannot upload",
        "why is my document", "connection error", "troubleshoot"
    ]
    if any(p in msg_lower for p in trouble_phrases):
        return "APPLICATION_TROUBLESHOOTING", None

    # 5. Application Feature / Workflow Help
    app_help_phrases = [
        "how do i create", "how to create", "how do requirements work", "how do user stories work",
        "how do tasks work", "how do conflicts work", "what does this button do", "how to use",
        "where do i find", "what should i do next", "how to generate"
    ]
    if any(p in msg_lower for p in app_help_phrases):
        return "COPILOT_HELP", None

    return "GENERAL_COPILOT", None


def process_copilot_chat(
    project_id: Optional[int],
    message: str,
    page_context: str = "Overview",
    user_role: str = "Developer",
    attachments: List[Dict[str, Any]] = []
) -> Dict[str, Any]:
    """
    Main Copilot Chat Processor (NON-RAG BY DEFAULT):
    1. Collects DB project metadata.
    2. Classifies intent.
    3. Handles DOCUMENT_SPECIFIC redirection gracefully.
    4. Prepares Gemini multimodal contents if attachments are present.
    5. Calls Gemini with application context and returns grounded product/project response.
    """
    if not message and not attachments:
        return {
            "success": False,
            "error": "Please enter a message or provide an attachment.",
            "answer": None,
            "mode": "copilot",
            "sources": []
        }

    # Step 1: Project Metadata
    metadata = get_project_metadata(project_id) if project_id else {}
    available_filenames = metadata.get("filenames", [])

    # Step 2: Classify Intent
    intent_type, target_doc = classify_copilot_intent(message, available_filenames)

    # Step 3: Handle DOCUMENT_SPECIFIC Redirection
    if intent_type == "DOCUMENT_SPECIFIC":
        doc_label = f" '{target_doc}'" if target_doc else ""
        redirect_msg = (
            f"I notice you are asking a question specifically about the uploaded document{doc_label}.\n\n"
            f"To get precise, document-grounded answers with exact source chunk citations, please open **Documents** from the navigation, select{doc_label}, and use the dedicated **Document AI Copilot** in the Document Reader."
        )
        return {
            "success": True,
            "answer": redirect_msg,
            "mode": "document_redirect",
            "redirect_document": target_doc,
            "sources": []
        }

    # Step 4: Handle EXPLICIT_DOCUMENT_ANALYSIS (Optional explicit RAG)
    if intent_type == "EXPLICIT_DOCUMENT_ANALYSIS" and project_id:
        from services.ai_service import answer_rag_question
        rag_res = answer_rag_question(project_id, message)
        return {
            "success": rag_res.get("success", False),
            "answer": rag_res.get("answer"),
            "mode": "explicit_document_analysis",
            "sources": rag_res.get("sources", [])
        }

    # Step 5: Build Multimodal Gemini Payload & System Prompt Context
    client = get_genai_client()
    if not client:
        return {
            "success": False,
            "error": "Gemini API key is not configured.",
            "answer": None,
            "mode": "copilot",
            "sources": []
        }

    # Format Context String
    metadata_summary = ""
    if metadata and metadata.get("project_name"):
        metadata_summary = (
            f"REAL-TIME PROJECT METADATA:\n"
            f"- Project Name: {metadata.get('project_name')}\n"
            f"- Description: {metadata.get('project_description') or 'N/A'}\n"
            f"- Total Documents: {metadata.get('document_count')} ({metadata.get('indexed_document_count')} indexed into vector storage)\n"
            f"- Uploaded Files: {', '.join(metadata.get('filenames', [])) or 'None'}\n"
            f"- Requirements Count: {metadata.get('requirement_count')}\n"
            f"- User Stories Count: {metadata.get('user_story_count')}\n"
            f"- Tasks Count: {metadata.get('task_count')} ({metadata.get('completed_task_count')} completed)\n"
            f"- Conflicts Detected: {metadata.get('conflict_count')}\n"
        )

    context_prompt = (
        f"{APPLICATION_CONTEXT}\n\n"
        f"CURRENT WORKSPACE CONTEXT:\n"
        f"- Current Active Page: {page_context}\n"
        f"- Current User Role: {user_role}\n"
        f"{metadata_summary}"
    )

    contents: List[Any] = []

    # Process Attachments (Multimodal Images / Text)
    attachment_text_blocks = []
    for att in attachments:
        att_name = att.get("name", "Attachment")
        att_type = att.get("type", "document")
        content_b64 = att.get("content_base64")
        mime_type = att.get("mime_type")

        if att_type == "image" and content_b64 and mime_type:
            try:
                # Strip base64 header if present
                if "," in content_b64:
                    content_b64 = content_b64.split(",")[1]
                raw_bytes = base64.b64decode(content_b64)
                image_part = types.Part.from_bytes(data=raw_bytes, mime_type=mime_type)
                contents.append(image_part)
                logger.info(f"Attached image {att_name} ({mime_type}) successfully converted for Gemini multimodal processing.")
            except Exception as img_err:
                logger.error(f"Error decoding image attachment {att_name}: {img_err}")
        elif att.get("text_content"):
            attachment_text_blocks.append(f"ATTACHED FILE [{att_name}]:\n{att.get('text_content')}")

    user_text_message = message.strip() if message else "Please analyze the attached content."
    if attachment_text_blocks:
        user_text_message += "\n\n" + "\n\n".join(attachment_text_blocks)

    contents.append(user_text_message)

    try:
        config = types.GenerateContentConfig(
            system_instruction=f"{MAIN_COPILOT_SYSTEM_INSTRUCTION}\n\n{context_prompt}",
            temperature=0.3,
            top_p=0.95
        )

        response = client.models.generate_content(
            model=DEFAULT_MODEL_NAME,
            contents=contents,
            config=config
        )

        answer_text = response.text.strip() if response and response.text else "No response generated."
        return {
            "success": True,
            "answer": answer_text,
            "mode": "copilot",
            "sources": []
        }
    except Exception as e:
        logger.error(f"Error in Main Copilot chat execution: {e}")
        return {
            "success": False,
            "error": f"AI Copilot service communication error: {e}",
            "answer": None,
            "mode": "copilot",
            "sources": []
        }
