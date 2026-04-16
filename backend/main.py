from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import students, employers, jobPostings, savedPostings, analytics, resources, applications
from routers import auth as auth_router
from routers import admin as admin_router
from routers import mentors

# Create all tables that don't exist yet (safe to call repeatedly)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="iMason Job Board API",
    description="Matching platform connecting students and employers through the iMasons network.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core resource routers
app.include_router(students.router)
app.include_router(employers.router)
app.include_router(jobPostings.router)
app.include_router(mentors.router)  # mentorship-specific endpoints
app.include_router(savedPostings.router)
app.include_router(analytics.router)
app.include_router(resources.router)
app.include_router(applications.router)

# Authentication router
app.include_router(auth_router.router)

# Admin moderation router
app.include_router(admin_router.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
