from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import students, employers, jobPostings, savedPostings, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(title="iMason Job Board API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(employers.router)
app.include_router(jobPostings.router)
app.include_router(savedPostings.router)
app.include_router(analytics.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
