from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from api.auth import get_current_user_from_token, verify_project_ownership, UserResponse
from services.copilot_service import process_copilot_chat

router = APIRouter(prefix="/copilot", tags=["Main Copilot"])


class CopilotChatRequest(BaseModel):
    project_id: Optional[int] = Field(None, description="Optional active project ID")
    message: str = Field(..., description="User query message text")
    page_context: str = Field("Overview", description="Active workspace page context")
    user_role: str = Field("Developer", description="User role")
    attachments: List[Dict[str, Any]] = Field([], description="Optional conversational attachments")


class CopilotChatResponse(BaseModel):
    success: bool
    answer: Optional[str] = None
    mode: str = "copilot"
    redirect_document: Optional[str] = None
    sources: List[Dict[str, Any]] = []
    error: Optional[str] = None


@router.post("/chat", response_model=CopilotChatResponse)
def chat_with_main_copilot(payload: CopilotChatRequest, current_user: UserResponse = Depends(get_current_user_from_token)):
    """
    Main Floating AI Copilot Endpoint:
    Provides application guidance, feature help, software engineering advice,
    and real-time project database metrics using services/copilot_service.py.
    """
    if payload.project_id:
        verify_project_ownership(payload.project_id, current_user)

    role = current_user.role or payload.user_role

    result = process_copilot_chat(
        project_id=payload.project_id,
        message=payload.message,
        page_context=payload.page_context,
        user_role=role,
        attachments=payload.attachments
    )

    return CopilotChatResponse(
        success=result.get("success", True),
        answer=result.get("answer"),
        mode=result.get("mode", "copilot"),
        redirect_document=result.get("redirect_document"),
        sources=result.get("sources", []),
        error=result.get("error")
    )
