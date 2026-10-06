import os
import logging
import jwt
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, status, Header
from pydantic import BaseModel
from services.database import get_db_session
from services.models import User

logger = logging.getLogger("ai_project_assistant.auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
PBKDF2_ITERATIONS = 310000
LEGACY_SALT = b"ai_project_assistant_secure_salt_2026"
LEGACY_ITERATIONS = 100000


def _require_secret_key() -> str:
    if not SECRET_KEY or len(SECRET_KEY) < 32:
        raise RuntimeError("JWT_SECRET_KEY must be configured with at least 32 characters.")
    return SECRET_KEY


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return "pbkdf2_sha256$" + str(PBKDF2_ITERATIONS) + "$" + salt.hex() + "$" + digest.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith("pbkdf2_sha256$"):
        try:
            _, iterations, salt_hex, digest_hex = hashed_password.split("$", 3)
            expected = hashlib.pbkdf2_hmac(
                "sha256", plain_password.encode("utf-8"), bytes.fromhex(salt_hex), int(iterations)
            ).hex()
            return hmac.compare_digest(expected, digest_hex)
        except (ValueError, TypeError):
            return False

    legacy = hashlib.pbkdf2_hmac(
        "sha256", plain_password.encode("utf-8"), LEGACY_SALT, LEGACY_ITERATIONS
    ).hex()
    return hmac.compare_digest(legacy, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, _require_secret_key(), algorithm=ALGORITHM)


class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "Developer"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


def get_current_user_from_token(authorization: str = Header(None)) -> UserResponse:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token",
        )
    parts = authorization.split(None, 1)
    if len(parts) != 2 or not parts[1].strip():
        raise HTTPException(status_code=401, detail="Missing or invalid authorization token")
    token = parts[1].strip()
    try:
        payload = jwt.decode(token, _require_secret_key(), algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        with get_db_session() as db:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            return UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                created_at=user.created_at.isoformat()
            )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token signature expired or invalid")


def verify_project_ownership(project_id: int, current_user: UserResponse):
    from services.project_service import get_project
    proj = get_project(project_id)
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )
    if proj.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this project."
        )
    return proj


@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    email = payload.email.strip().lower()
    logger.info(f"POST /api/auth/signup - processing signup for normalized email: '{email}'")
    if not email or "@" not in email or email.count("@") != 1 or "." not in email.rsplit("@", 1)[-1]:
        raise HTTPException(status_code=400, detail="Invalid email address.")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    with get_db_session() as db:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

        new_user = User(
            email=email,
            password_hash=hash_password(payload.password),
            full_name=payload.full_name.strip() or "Project User",
            role=payload.role.strip() or "Developer"
        )
        db.add(new_user)
        db.flush()

        token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
        user_resp = UserResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            role=new_user.role,
            created_at=new_user.created_at.isoformat()
        )
        return AuthTokenResponse(access_token=token, user=user_resp)


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    logger.info(f"POST /api/auth/login - processing login for normalized email: '{email}'")
    with get_db_session() as db:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        user_resp = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            created_at=user.created_at.isoformat()
        )
        return AuthTokenResponse(access_token=token, user=user_resp)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user_from_token)):
    return current_user
