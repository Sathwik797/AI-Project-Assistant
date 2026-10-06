import unittest
import os
from contextlib import contextmanager
from datetime import datetime, timezone
from unittest.mock import patch

os.environ.setdefault("JWT_SECRET_KEY", "test-only-jwt-secret-key-with-32-plus-bytes")

import jwt

from api.auth import ALGORITHM, SECRET_KEY, create_access_token, hash_password, verify_password
from api.rag import index_project_document
from api.schemas import DocumentResponse, QuestionRequest
from api.tasks import TaskCreate, create_task
from services.models import Project, TaskItem


class _FakeProject:
    id = 41


class _FakeQuery:
    def __init__(self, model):
        self.model = model

    def filter(self, *args):
        return self

    def first(self):
        return _FakeProject() if self.model is Project else None

    def count(self):
        return 2 if self.model is TaskItem else 0


class _FakeTaskSession:
    def query(self, model):
        return _FakeQuery(model)

    def add(self, task):
        task.id = 99
        task.created_at = datetime.now(timezone.utc)

    def flush(self):
        pass


@contextmanager
def _fake_task_session():
    yield _FakeTaskSession()


class ApiContractTests(unittest.TestCase):
    def test_document_response_uses_is_indexed(self):
        document = DocumentResponse(
            id=7,
            project_id=41,
            filename="spec.pdf",
            file_type="pdf",
            file_size=1024,
            created_at=datetime.now(timezone.utc),
            is_indexed=True,
            chunk_count=4,
        )
        payload = document.model_dump() if hasattr(document, "model_dump") else document.dict()
        self.assertTrue(payload["is_indexed"])
        self.assertNotIn("indexed", payload)

    def test_indexing_response_exposes_chunk_count_under_index_info(self):
        fake_user = type("UserResponse", (), {"id": 1, "email": "test@test.com", "full_name": "Test", "role": "Dev"})()
        document = type("Document", (), {"id": 7, "project_id": 41})()
        index_info = {
            "document_id": 7,
            "project_id": 41,
            "filename": "spec.pdf",
            "chunk_count": 4,
            "status": "indexed",
        }
        with patch("api.rag.get_document", return_value=document), patch(
            "api.rag.verify_project_ownership", return_value=None
        ), patch(
            "api.rag.index_document", return_value=(True, "Indexed", index_info)
        ):
            response = index_project_document(7, current_user=fake_user)

        payload = response.model_dump() if hasattr(response, "model_dump") else response.dict()
        self.assertTrue(payload["success"])
        self.assertEqual(payload["index_info"]["chunk_count"], 4)
        self.assertNotIn("chunks_created", payload)

    def test_task_creation_preserves_task_create_fields(self):
        fake_user = type("UserResponse", (), {"id": 1, "email": "test@test.com", "full_name": "Test", "role": "Dev"})()
        request = TaskCreate(
            title="Implement task API",
            description="Send the complete task payload from the frontend.",
            status="In Progress",
            priority="High",
            assignee="Alex",
            due_date="2026-09-01",
        )
        with patch("api.tasks.verify_project_ownership", return_value=None), patch("api.tasks.get_db_session", _fake_task_session):
            response = create_task(41, request, current_user=fake_user)

        self.assertEqual(response.title, request.title)
        self.assertEqual(response.description, request.description)
        self.assertEqual(response.status, request.status)
        self.assertEqual(response.priority, request.priority)
        self.assertEqual(response.assignee, request.assignee)
        self.assertEqual(response.due_date, request.due_date)

    def test_question_validation_remains_a_422_contract(self):
        with self.assertRaises(Exception):
            QuestionRequest(question="")

    def test_password_and_jwt_contracts_remain_valid(self):
        password_hash = hash_password("correct horse battery staple")
        self.assertTrue(verify_password("correct horse battery staple", password_hash))
        self.assertFalse(verify_password("incorrect", password_hash))
        self.assertTrue(password_hash.startswith("pbkdf2_sha256$"))

        token = create_access_token({"sub": "7", "email": "user@example.com"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        self.assertEqual(payload["sub"], "7")


if __name__ == "__main__":
    unittest.main()
