from sqlalchemy import Column, Integer, Text, CheckConstraint, ForeignKey, UniqueConstraint, text
from sqlalchemy.orm import relationship
from database import Base

NOW = text("(datetime('now'))")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, autoincrement=True)
    firstName = Column(Text, nullable=False)
    lastName = Column(Text, nullable=False)
    email = Column(Text, nullable=False, unique=True)
    bio = Column(Text, default="")
    location = Column(Text, default="")
    skills = Column(Text, default="")
    resumeLink = Column(Text, default="")
    linkedinUrl = Column(Text, default="")
    githubUrl = Column(Text, default="")
    portfolioUrl = Column(Text, default="")
    isActive = Column(Integer, default=1)
    createdAt = Column(Text, server_default=NOW)
    updatedAt = Column(Text, server_default=NOW)

    savedPostings = relationship("SavedPosting", back_populates="student", cascade="all, delete-orphan")


class Employer(Base):
    __tablename__ = "employers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    companyName = Column(Text, nullable=False)
    contactEmail = Column(Text, nullable=False, unique=True)
    industry = Column(Text, default="")
    location = Column(Text, default="")
    description = Column(Text, default="")
    websiteUrl = Column(Text, default="")
    createdAt = Column(Text, server_default=NOW)
    updatedAt = Column(Text, server_default=NOW)

    jobPostings = relationship("JobPosting", back_populates="employer", cascade="all, delete-orphan")


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employerId = Column(Integer, ForeignKey("employers.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(Text, default="")
    jobType = Column(Text, nullable=False)
    industry = Column(Text, default="")
    isActive = Column(Integer, default=1)
    createdAt = Column(Text, server_default=NOW)
    updatedAt = Column(Text, server_default=NOW)

    __table_args__ = (
        CheckConstraint("jobType IN ('internship', 'full-time', 'part-time', 'mentorship')"),
    )

    employer = relationship("Employer", back_populates="jobPostings")
    customQuestions = relationship("CustomQuestion", back_populates="jobPosting", cascade="all, delete-orphan")
    savedPostings = relationship("SavedPosting", back_populates="jobPosting", cascade="all, delete-orphan")


class CustomQuestion(Base):
    __tablename__ = "custom_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    jobPostingId = Column(Integer, ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False)
    questionText = Column(Text, nullable=False)
    questionOrder = Column(Integer, default=0)

    jobPosting = relationship("JobPosting", back_populates="customQuestions")


class SavedPosting(Base):
    __tablename__ = "saved_postings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    studentId = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    jobPostingId = Column(Integer, ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False)
    savedAt = Column(Text, server_default=NOW)

    __table_args__ = (
        UniqueConstraint("studentId", "jobPostingId"),
    )

    student = relationship("Student", back_populates="savedPostings")
    jobPosting = relationship("JobPosting", back_populates="savedPostings")


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    eventType = Column(Text, nullable=False)
    targetId = Column(Integer, nullable=False)
    viewerRole = Column(Text, default="")
    createdAt = Column(Text, server_default=NOW)

    __table_args__ = (
        CheckConstraint("eventType IN ('profile_view', 'posting_view')"),
    )
