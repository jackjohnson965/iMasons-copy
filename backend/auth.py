"""
auth.py — JWT creation/verification utilities and FastAPI dependency.

Uses python-jose for JWT and passlib[bcrypt] for password hashing.
All authentication logic lives here to keep it centralized and easy to audit.
"""
import os
import re
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db

# --- Configuration ---
# In production, set IMASONS_SECRET_KEY as an environment variable.
# The default here is for local development only.
SECRET_KEY = os.environ.get("IMASONS_SECRET_KEY", "CHANGE_ME_IN_PRODUCTION_USE_ENV_VAR")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8   # 8-hour tokens

# iMasons identifier patterns per role
# Format: XXX-DDDD where XXX is the role prefix and DDDD is exactly 4 digits
IDENTIFIER_PATTERNS = {
    "student":  re.compile(r"^STU-\d{4}$"),
    "employer": re.compile(r"^EMP-\d{4}$"),
    "admin":    re.compile(r"^ADM-\d{4}$"),
}

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token extractor — integrates with FastAPI OpenAPI docs (adds Authorize button)
bearer_scheme = HTTPBearer()
optional_bearer_scheme = HTTPBearer(auto_error=False)


# --- Password utilities ---

def hash_password(plain: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return pwd_context.verify(plain, hashed)


# --- JWT utilities ---

def create_access_token(data: dict) -> str:
    """
    Create a signed JWT.
    data should contain: sub (user id as string), role, linkedProfileId.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT. Raises HTTPException 401 on any failure.
    Returns the decoded payload dict.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --- iMasons identifier validation ---

def validate_identifier(role: str, identifier: str) -> None:
    """
    Raise HTTPException 422 if the identifier does not match the role's pattern.
    Students: STU-XXXX, Employers: EMP-XXXX, Admins: ADM-XXXX
    """
    pattern = IDENTIFIER_PATTERNS.get(role)
    if not pattern:
        raise HTTPException(status_code=422, detail=f"Unknown role: {role}")
    if not pattern.match(identifier.upper()):
        raise HTTPException(
            status_code=422,
            detail=(
                f"iMasons identifier for role '{role}' must match "
                f"{pattern.pattern}. Example: "
                f"{'STU' if role == 'student' else 'EMP' if role == 'employer' else 'ADM'}-1234"
            ),
        )


# --- FastAPI dependency: get the current authenticated user ---

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency. Extracts the Bearer token from the Authorization header,
    verifies it, and returns the User ORM object.
    Raises 401 if token is missing, invalid, or the user no longer exists.
    Import User model here to avoid circular imports at module level.
    """
    from models import User

    token = credentials.credentials
    payload = decode_access_token(token)

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user

def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer_scheme),
    db: Session = Depends(get_db),
):
    """
    Optional-auth variant of get_current_user.
    Returns None if no Authorization header is present; otherwise enforces
    normal JWT validity and user existence checks.
    """
    from models import User

    if credentials is None:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


def require_role(*allowed_roles: str):
    """
    Dependency factory that checks the authenticated user's role.

    Usage:
        @router.get("/admin/...", dependencies=[Depends(require_role("admin"))])
        @router.get("/...", dependencies=[Depends(require_role("student", "employer"))])
    """
    def dependency(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}",
            )
        return current_user
    return dependency
