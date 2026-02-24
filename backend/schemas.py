from pydantic import BaseModel, ConfigDict
from typing import Optional


# --- Student Schemas ---

class StudentCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    bio: str = ""
    location: str = ""
    skills: str = ""
    resumeLink: str = ""
    linkedinUrl: str = ""
    githubUrl: str = ""
    portfolioUrl: str = ""
    isActive: int = 1


class StudentUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[str] = None
    resumeLink: Optional[str] = None
    linkedinUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    portfolioUrl: Optional[str] = None
    isActive: Optional[int] = None


class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    firstName: str
    lastName: str
    email: str
    bio: str
    location: str
    skills: str
    resumeLink: str
    linkedinUrl: str
    githubUrl: str
    portfolioUrl: str
    isActive: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


# --- Employer Schemas ---

class EmployerCreate(BaseModel):
    companyName: str
    contactEmail: str
    industry: str = ""
    location: str = ""
    description: str = ""
    websiteUrl: str = ""


class EmployerUpdate(BaseModel):
    companyName: Optional[str] = None
    contactEmail: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    websiteUrl: Optional[str] = None


class EmployerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    companyName: str
    contactEmail: str
    industry: str
    location: str
    description: str
    websiteUrl: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


# --- Custom Question Schemas ---

class CustomQuestionCreate(BaseModel):
    questionText: str
    questionOrder: int = 0


class CustomQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    jobPostingId: int
    questionText: str
    questionOrder: int


# --- Job Posting Schemas ---

class JobPostingCreate(BaseModel):
    employerId: int
    title: str
    description: str
    location: str = ""
    jobType: str
    industry: str = ""
    customQuestions: list[CustomQuestionCreate] = []


class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    jobType: Optional[str] = None
    industry: Optional[str] = None
    isActive: Optional[int] = None


class JobPostingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employerId: int
    title: str
    description: str
    location: str
    jobType: str
    industry: str
    isActive: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    customQuestions: list[CustomQuestionResponse] = []


class JobPostingListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employerId: int
    title: str
    description: str
    location: str
    jobType: str
    industry: str
    isActive: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


# --- Saved Posting Schemas ---

class SavedPostingCreate(BaseModel):
    studentId: int
    jobPostingId: int


class SavedPostingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    studentId: int
    jobPostingId: int
    savedAt: Optional[str] = None


class SavedPostingWithJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    studentId: int
    jobPostingId: int
    savedAt: Optional[str] = None
    jobPosting: JobPostingListResponse


# --- Analytics Schemas ---

class AnalyticsEventCreate(BaseModel):
    eventType: str
    targetId: int
    viewerRole: str = ""


class AnalyticsEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    eventType: str
    targetId: int
    viewerRole: str
    createdAt: Optional[str] = None


class AnalyticsSummary(BaseModel):
    totalViews: int
    recentViews: list[AnalyticsEventResponse] = []


class EmployerAnalyticsSummary(BaseModel):
    totalViews: int
    postingBreakdown: list[dict] = []
