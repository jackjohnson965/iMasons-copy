# iMasons Job Board

A web application connecting students and employers through the iMasons network for internships, mentorships, and employment opportunities.

CS 5351 - Senior Design, Spring 2026

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Python (FastAPI)
- **Database**: SQLite (via SQLAlchemy)

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Seed Demo Data

```bash
cd backend
source venv/bin/activate
python seed.py
```

### Running the App

Open two terminal tabs:

**Tab 1 - Backend (port 8000):**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Tab 2 - Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Features

- **Role Selection**: Choose Student or Employer on the home page
- **Student Profiles**: Create/edit profile with bio, skills, links (LinkedIn, GitHub, portfolio)
- **Job Postings**: Employers can create postings with custom application questions
- **Search & Filter**: Filter jobs by type, location, industry; search students by skills
- **Save for Later**: Students can save job postings to their dashboard
- **Analytics Dashboard**: View counts for student profiles and job postings

## API Documentation

With the backend running, visit http://localhost:8000/docs for the interactive Swagger API docs.

## Project Structure

```
backend/          # FastAPI backend
  main.py         # App entry point
  models.py       # SQLAlchemy ORM models
  schemas.py      # Pydantic request/response schemas
  database.py     # Database connection setup
  seed.py         # Demo data script
  routers/        # API route handlers

frontend/         # React frontend
  src/
    pages/        # Page components
    components/   # Shared UI components
    context/      # React Context (role state)
    hooks/        # Custom hooks
    api.js        # API client
```
