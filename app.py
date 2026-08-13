import os
import streamlit as st
from dotenv import load_dotenv

from services.database import check_db_connection, init_db
from services.project_service import create_project, get_projects, get_project
from services.document_service import (
    process_and_save_document,
    get_documents_by_project,
    get_document,
    delete_document
)
from services.rag_ingestion_service import (
    index_document,
    get_document_index_status,
    search_project_documents
)
from services.ai_service import answer_rag_question

# Load environment variables
load_dotenv()

# Page Configuration
st.set_page_config(
    page_title="AI Project Assistant",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load External CSS System
def load_css():
    css_path = os.path.join(os.path.dirname(__file__), "styles.css")
    if os.path.exists(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

load_css()

# Helper function to format file sizes cleanly
def format_file_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"

# Initialize Session State
if "active_project_id" not in st.session_state:
    st.session_state["active_project_id"] = None
if "chat_history" not in st.session_state:
    st.session_state["chat_history"] = []
if "viewing_document_id" not in st.session_state:
    st.session_state["viewing_document_id"] = None

# Database Health Check & Table Initialization
db_ok, db_msg = check_db_connection()
if db_ok:
    try:
        init_db()
    except Exception as init_err:
        db_ok = False
        db_msg = f"Failed to initialize database tables: {init_err}"


# ----------------------------------------------------
# 1. RENDER COMPACT SAAS SIDEBAR
# ----------------------------------------------------
def render_sidebar():
    st.sidebar.markdown("### ⚡ AI Project Assistant")
    st.sidebar.caption("Workspace Navigator")
    
    st.sidebar.markdown("---")

    # Project Search Filter
    search_query = st.sidebar.text_input(
        "Search projects...",
        placeholder="Filter projects...",
        label_visibility="collapsed",
        key="search_projects_input"
    )

    # + New Project Expander Form
    with st.sidebar.expander("➕ **New Project**", expanded=False):
        with st.form("sidebar_create_project_form", clear_on_submit=True):
            p_name = st.text_input("Project Name *", max_chars=100)
            p_desc = st.text_area("Description", height=60)
            btn_create = st.form_submit_button("Create Project", type="primary", use_container_width=True)
            
            if btn_create:
                ok, msg, new_p = create_project(p_name, p_desc)
                if ok:
                    st.session_state["active_project_id"] = new_p.id
                    st.session_state["chat_history"] = []
                    st.success("Project created!")
                    st.rerun()
                else:
                    st.error(msg)

    st.sidebar.markdown("##### PROJECTS")
    all_projects = get_projects()

    if not all_projects:
        st.sidebar.caption("No projects created yet.")
    else:
        # Default active project selection
        if st.session_state["active_project_id"] is None:
            st.session_state["active_project_id"] = all_projects[0].id

        filtered_projects = [
            p for p in all_projects 
            if not search_query or search_query.lower() in p.name.lower()
        ]

        # Compact Project Rows List
        for proj in filtered_projects:
            is_active = (proj.id == st.session_state["active_project_id"])
            btn_style = "primary" if is_active else "secondary"
            btn_label = f"📁 {proj.name}  ●" if is_active else f"📁 {proj.name}"
            
            if st.sidebar.button(btn_label, key=f"proj_row_{proj.id}", type=btn_style, use_container_width=True):
                if st.session_state["active_project_id"] != proj.id:
                    st.session_state["active_project_id"] = proj.id
                    st.session_state["chat_history"] = []
                    st.session_state["viewing_document_id"] = None
                    st.rerun()

    # System Status Footer
    st.sidebar.markdown("---")
    st.sidebar.markdown("##### SYSTEM STATUS")
    if db_ok:
        st.sidebar.caption("🟢 MySQL Connected")
    else:
        st.sidebar.caption("🔴 MySQL Disconnected")
    st.sidebar.caption("🟢 Vector Store Ready")
    st.sidebar.caption("🟢 AI Ready")


# ----------------------------------------------------
# 2. RENDER COMPACT HEADER
# ----------------------------------------------------
def render_top_header(active_project):
    proj_name = active_project.name if active_project else "No Project Selected"
    st.markdown(f"""
    <div class="saas-header">
        <div>
            <div class="saas-header-title">AI Project Assistant</div>
            <div class="saas-header-subtitle">Workspace: <strong>{proj_name}</strong></div>
        </div>
        <div>
            <span class="status-badge-ai">● AI Ready</span>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ----------------------------------------------------
# 3. RENDER AI ASSISTANT VIEW (Primary Experience)
# ----------------------------------------------------
def render_ai_assistant(active_project):
    if not active_project:
        st.info("Create a project to get started.")
        return

    st.markdown(f"Working with: **{active_project.name}**")
    st.caption("Ask questions, analyze requirements, or query your project document knowledge base.")

    p_docs = get_documents_by_project(active_project.id)
    indexed_docs = [d for d in p_docs if get_document_index_status(d.id)["is_indexed"]]

    if not indexed_docs:
        st.warning("No indexed documents available. Upload and index a document under the **Documents** section to enable AI question answering.")
        return

    # Suggested Action Chips Section
    st.markdown("##### SUGGESTED ACTIONS")
    c1, c2, c3, c4, c5, c6 = st.columns(6)
    
    action_prompt = None
    if c1.button("Analyze Requirements", use_container_width=True):
        action_prompt = "Analyze the key requirements mentioned in the project documents."
    if c2.button("Generate User Stories", use_container_width=True):
        action_prompt = "What user stories can be derived from the requirements?"
    if c3.button("Acceptance Criteria", use_container_width=True):
        action_prompt = "What acceptance criteria are specified in the documents?"
    if c4.button("Find Conflicts", use_container_width=True):
        action_prompt = "Are there any requirement conflicts or ambiguities in the documents?"
    if c5.button("Generate Tasks", use_container_width=True):
        action_prompt = "What high-level technical tasks are required for development?"
    if c6.button("Summarize Project", use_container_width=True):
        action_prompt = "Summarize the project goals, features, and constraints."

    if action_prompt:
        st.session_state["pending_question"] = action_prompt

    st.markdown("---")

    # Conversation History Display
    chat_container = st.container()
    with chat_container:
        if not st.session_state["chat_history"]:
            st.markdown('<div class="chat-ai-bubble"><strong>AI Assistant:</strong><br>How can I help with your project documents?</div>', unsafe_allow_html=True)
        else:
            for chat in st.session_state["chat_history"]:
                if chat["role"] == "user":
                    st.markdown(f'<div class="chat-user-bubble"><strong>You:</strong><br>{chat["content"]}</div>', unsafe_allow_html=True)
                else:
                    st.markdown(f'<div class="chat-ai-bubble"><strong>AI Assistant:</strong><br><br>{chat["content"]}</div>', unsafe_allow_html=True)
                    sources = chat.get("sources", [])
                    if sources:
                        with st.expander("📚 View Retrieved Sources", expanded=False):
                            for idx, src in enumerate(sources, 1):
                                st.markdown(f"**Source #{idx}:** `{src.get('filename')}` (Chunk #{src.get('chunk_index')}, Distance: `{src.get('distance', 0.0):.4f}`)")
                                st.write(src.get("chunk_text"))
                                st.markdown("---")

    # Prominent Chat Input Area
    default_q = st.session_state.pop("pending_question", "")
    user_q = st.text_area(
        "Ask about your project...",
        value=default_q,
        placeholder="Ask anything about your project documents...",
        height=80,
        key="main_ai_question_input"
    )

    col_send, col_space = st.columns([1, 4])
    with col_send:
        btn_ask = st.button("Send / Ask AI", type="primary", use_container_width=True)

    if btn_ask:
        if not user_q or not user_q.strip():
            st.warning("Please enter a question about your project documents.")
        else:
            st.session_state["chat_history"].append({"role": "user", "content": user_q.strip(), "sources": []})
            
            with st.spinner("Searching project knowledge... Generating answer..."):
                res = answer_rag_question(active_project.id, user_q.strip())

            if not res["success"]:
                ai_answer = res.get("error", "Failed to generate answer.")
                sources = []
            else:
                ai_answer = res["answer"]
                sources = res.get("sources", [])

            st.session_state["chat_history"].append({
                "role": "ai",
                "content": ai_answer,
                "sources": sources
            })

            st.rerun()


# ----------------------------------------------------
# 4. RENDER DOCUMENTS VIEW
# ----------------------------------------------------
def render_documents(active_project):
    if not active_project:
        st.info("Create a project to get started.")
        return

    st.subheader("Project Documents")
    st.caption("Upload and manage project knowledge.")

    # Upload Section
    with st.expander("📤 **Upload Document**", expanded=True):
        st.caption("Supported formats: **PDF**, **DOCX**, **TXT** | Maximum size: **15 MB**")
        uploaded_file = st.file_uploader(
            "Choose a document",
            type=["pdf", "docx", "txt"],
            label_visibility="collapsed"
        )
        if st.button("Upload & Process", type="primary", disabled=(uploaded_file is None)):
            if uploaded_file is not None:
                with st.spinner("Uploading and extracting text..."):
                    ok, msg, new_doc = process_and_save_document(active_project.id, uploaded_file)
                if ok:
                    st.success("Document uploaded successfully.")
                    st.rerun()
                else:
                    st.error(msg)

    st.markdown("---")

    p_docs = get_documents_by_project(active_project.id)

    if not p_docs:
        st.info("Upload project documents to build your project knowledge base.")
    else:
        st.markdown("##### DOCUMENT KNOWLEDGE BASE")
        for doc in p_docs:
            idx_status = get_document_index_status(doc.id)
            status_str = f"Indexed ● ({idx_status['chunk_count']} chunks)" if idx_status["is_indexed"] else "Not indexed ○"

            with st.container():
                c_name, c_info, c_status, c_actions = st.columns([3, 2, 2, 3])
                
                with c_name:
                    st.write(f"📄 **{doc.filename}**")
                with c_info:
                    st.write(f"{doc.file_type.upper()} · {format_file_size(doc.file_size)}")
                with c_status:
                    if idx_status["is_indexed"]:
                        st.success(status_str)
                    else:
                        st.warning(status_str)
                with c_actions:
                    ca1, ca2, ca3 = st.columns(3)
                    with ca1:
                        if st.button("View", key=f"doc_view_{doc.id}"):
                            st.session_state["viewing_document_id"] = doc.id
                            st.rerun()
                    with ca2:
                        btn_label = "Re-index" if idx_status["is_indexed"] else "Index"
                        if st.button(btn_label, key=f"doc_idx_{doc.id}", type="primary"):
                            sp = st.empty()
                            sp.info("Reading document...")
                            sp.info("Creating chunks...")
                            sp.info("Generating embeddings...")
                            sp.info("Updating knowledge base...")
                            ok, msg, info = index_document(doc.id)
                            if ok:
                                sp.success(f"Indexed {info['chunk_count']} chunks.")
                                st.rerun()
                            else:
                                sp.error(msg)
                    with ca3:
                        if st.button("Delete", key=f"doc_del_{doc.id}"):
                            ok, msg = delete_document(doc.id)
                            if ok:
                                if st.session_state["viewing_document_id"] == doc.id:
                                    st.session_state["viewing_document_id"] = None
                                st.success("Deleted document.")
                                st.rerun()
                            else:
                                st.error(msg)

                st.markdown("<hr style='margin: 0.3rem 0; border-color: #E2E8F0;'>", unsafe_allow_html=True)

    # Document Detail Overlay
    if st.session_state["viewing_document_id"]:
        render_document_detail(st.session_state["viewing_document_id"])


# ----------------------------------------------------
# 5. RENDER DOCUMENT DETAIL OVERLAY
# ----------------------------------------------------
def render_document_detail(doc_id: int):
    doc = get_document(doc_id)
    if not doc:
        st.session_state["viewing_document_id"] = None
        return

    st.markdown("---")
    col_h, col_close = st.columns([4, 1])
    with col_h:
        st.subheader(f"Document Detail: {doc.filename}")
    with col_close:
        if st.button("Close View", key="close_doc_detail"):
            st.session_state["viewing_document_id"] = None
            st.rerun()

    idx_status = get_document_index_status(doc.id)
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("File Type", doc.file_type.upper())
    c2.metric("Size", format_file_size(doc.file_size))
    c3.metric("AI Index", "✓ Indexed" if idx_status["is_indexed"] else "○ Not Indexed")
    c4.metric("Chunks Stored", idx_status["chunk_count"] if idx_status["is_indexed"] else 0)

    st.markdown("**Extracted Text Content:**")
    raw_text = doc.raw_text if doc.raw_text else ""
    if not raw_text.strip():
        st.warning("No readable text content extracted.")
    else:
        st.text_area(
            "Extracted Text Content",
            value=raw_text,
            height=260,
            disabled=True,
            label_visibility="collapsed"
        )


# ----------------------------------------------------
# 6. RENDER OVERVIEW VIEW
# ----------------------------------------------------
def render_overview(active_project):
    if not active_project:
        st.info("Create a project to get started.")
        return

    st.subheader("Project Dashboard")
    st.markdown(f"### **{active_project.name}**")
    desc = active_project.description if active_project.description else "_No description provided._"
    st.write(desc)

    st.markdown("---")

    p_docs = get_documents_by_project(active_project.id)
    total_docs = len(p_docs)
    indexed_docs = sum(1 for d in p_docs if get_document_index_status(d.id)["is_indexed"])
    total_bytes = sum(d.file_size for d in p_docs)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(f"""
        <div class="saas-metric-card">
            <div class="saas-metric-label">Documents</div>
            <div class="saas-metric-value">{total_docs}</div>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
        <div class="saas-metric-card">
            <div class="saas-metric-label">Indexed Documents</div>
            <div class="saas-metric-value">{indexed_docs}</div>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
        <div class="saas-metric-card">
            <div class="saas-metric-label">Storage Used</div>
            <div class="saas-metric-value">{format_file_size(total_bytes)}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.subheader("Recent Documents")

    if not p_docs:
        st.info("No documents uploaded yet.")
    else:
        for doc in p_docs[:5]:
            idx_status = get_document_index_status(doc.id)
            badge = "Indexed ●" if idx_status["is_indexed"] else "Not indexed ○"
            date_str = doc.created_at.strftime("%Y-%m-%d") if doc.created_at else "N/A"
            
            with st.container():
                c1, c2, c3, c4 = st.columns([3, 1, 2, 2])
                c1.write(f"📄 **{doc.filename}** (`{doc.file_type.upper()}`)")
                c2.write(format_file_size(doc.file_size))
                c3.write(badge)
                c4.write(date_str)
                st.markdown("<hr style='margin: 0.25rem 0; border-color: #E2E8F0;'>", unsafe_allow_html=True)


# ----------------------------------------------------
# 7. RENDER FUTURE SECTION PLACEHOLDER
# ----------------------------------------------------
def render_coming_soon(feature_name: str):
    st.markdown(f"""
    <div class="coming-soon-card">
        <h3>{feature_name}</h3>
        <p>This automated AI artifact generation capability is scheduled for a future development phase.</p>
    </div>
    """, unsafe_allow_html=True)


# ----------------------------------------------------
# MAIN APPLICATION ENTRY POINT
# ----------------------------------------------------
def main():
    if not db_ok:
        st.error(f"Database Connection Error: {db_msg}")
        st.warning("Please verify your DATABASE_URL configuration in the .env file.")
        return

    # Render Sidebar
    render_sidebar()

    # Active Project Context
    active_project = get_project(st.session_state["active_project_id"]) if st.session_state["active_project_id"] else None
    
    # Render Compact Header
    render_top_header(active_project)

    # 7 Workspace Sub-Navigation Tabs
    tab_ai, tab_docs, tab_overview, tab_req, tab_stories, tab_tasks, tab_conflicts = st.tabs([
        "🤖 AI Assistant",
        "📄 Documents",
        "📊 Overview",
        "📝 Requirements",
        "👤 User Stories",
        "⚙️ Tasks",
        "⚠️ Conflicts"
    ])

    with tab_ai:
        render_ai_assistant(active_project)

    with tab_docs:
        render_documents(active_project)

    with tab_overview:
        render_overview(active_project)

    with tab_req:
        render_coming_soon("Requirements Analysis & Specification Workspace")

    with tab_stories:
        render_coming_soon("User Story & Acceptance Criteria Generation Workspace")

    with tab_tasks:
        render_coming_soon("Technical Development Task Workspace")

    with tab_conflicts:
        render_coming_soon("Requirement Conflict & Ambiguity Detection Workspace")


if __name__ == "__main__":
    main()
