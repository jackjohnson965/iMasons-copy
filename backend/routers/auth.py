"""
routers/auth.py — Registration and login endpoints.

POST /api/auth/register         — Create a new User account with iMasons identifier
POST /api/auth/login            — Authenticate and receive a JWT token
POST /api/auth/link-profile/:id — Link a newly created Student/Employer profile to the User
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserRegister, UserLogin, TokenResponse
from auth import hash_password, verify_password, create_access_token, validate_identifier, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Validates:
    - role is 'student', 'employer', or 'admin'
    - imasonsIdentifier matches the role prefix (STU-XXXX, EMP-XXXX, ADM-XXXX)
    - email is not already registered
    - imasonsIdentifier is not already registered

    On success:
    - Hashes the password and creates the User row
    - Returns a JWT token so the user is immediately logged in
    - linkedProfileId will be None until the user creates their Student/Employer profile
    """
    # Validate role
    if body.role not in ("student", "employer", "admin"):
        raise HTTPException(status_code=422, detail="role must be 'student', 'employer', or 'admin'")

    # Normalize and validate iMasons identifier format
    identifier = body.imasonsIdentifier.upper()
    validate_identifier(body.role, identifier)

    # Check for duplicate email
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Check for duplicate iMasons identifier
    if db.query(User).filter(User.imasonsIdentifier == identifier).first():
        raise HTTPException(status_code=409, detail="iMasons identifier already in use")

    # Create user
    db_user = User(
        email=body.email,
        hashedPassword=hash_password(body.password),
        role=body.role,
        imasonsIdentifier=identifier,
        linkedProfileId=None,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Issue token with user info baked in
    token = create_access_token({
        "sub": str(db_user.id),
        "role": db_user.role,
        "linkedProfileId": db_user.linkedProfileId,
    })

    return TokenResponse(
        access_token=token,
        role=db_user.role,
        userId=db_user.id,
        linkedProfileId=db_user.linkedProfileId,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user by email and password.
    Returns a JWT token on success.

    Always returns 401 for both "user not found" and "wrong password"
    to avoid user enumeration attacks.
    """
    user = db.query(User).filter(User.email == body.email).first()

    # Always verify — even if user is None — to prevent timing-based user enumeration
    dummy_hash = "$2b$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    password_to_verify = user.hashedPassword if user else dummy_hash
    if not user or not verify_password(body.password, password_to_verify):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "linkedProfileId": user.linkedProfileId,
    })

    return TokenResponse(
        access_token=token,
        role=user.role,
        userId=user.id,
        linkedProfileId=user.linkedProfileId,
    )


@router.post("/link-profile/{profile_id}", response_model=TokenResponse)
def link_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Link a newly created Student or Employer profile to the authenticated User.

    Call this endpoint immediately after POST /api/students or POST /api/employers
    returns the new profile ID. Returns a fresh JWT with linkedProfileId populated.
    """
    current_user.linkedProfileId = profile_id
    db.commit()
    db.refresh(current_user)

    # Re-issue token with updated linkedProfileId
    token = create_access_token({
        "sub": str(current_user.id),
        "role": current_user.role,
        "linkedProfileId": current_user.linkedProfileId,
    })

    return TokenResponse(
        access_token=token,
        role=current_user.role,
        userId=current_user.id,
        linkedProfileId=current_user.linkedProfileId,
    )
