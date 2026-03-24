"""Seed the database with sample data for demo purposes."""
from database import SessionLocal, engine, Base
from models import Student, Employer, JobPosting, CustomQuestion, AnalyticsEvent, User, Resource
from auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data in dependency order
for model in [AnalyticsEvent, CustomQuestion, JobPosting, User, Student, Employer, Resource]:
    db.query(model).delete()
db.commit()

# Students
students = [
    Student(firstName="Alice", lastName="Johnson", email="alice@example.com",
            bio="Computer Science senior passionate about full-stack development and cloud computing.",
            location="Dallas, TX", skills="Python,React,AWS,SQL,Docker",
            linkedinUrl="https://linkedin.com/in/alice", githubUrl="https://github.com/alice", isActive=1),
    Student(firstName="Bob", lastName="Smith", email="bob@example.com",
            bio="Data science enthusiast with a strong foundation in machine learning and statistics.",
            location="Austin, TX", skills="Python,R,TensorFlow,SQL,Tableau",
            linkedinUrl="https://linkedin.com/in/bob", isActive=1),
    Student(firstName="Carmen", lastName="Garcia", email="carmen@example.com",
            bio="Cybersecurity major with hands-on experience in penetration testing and network security.",
            location="Houston, TX", skills="Python,Linux,Wireshark,Nmap,Burp Suite",
            githubUrl="https://github.com/carmen", isActive=1),
    Student(firstName="David", lastName="Lee", email="david@example.com",
            bio="Software engineering student focused on mobile development and UI/UX design.",
            location="San Francisco, CA", skills="React Native,Swift,Figma,JavaScript,TypeScript",
            linkedinUrl="https://linkedin.com/in/david", portfolioUrl="https://davidlee.dev", isActive=1),
    Student(firstName="Emily", lastName="Chen", email="emily@example.com",
            bio="DevOps and cloud infrastructure enthusiast looking for internship opportunities.",
            location="Dallas, TX", skills="Kubernetes,Terraform,AWS,GCP,CI/CD",
            linkedinUrl="https://linkedin.com/in/emily", githubUrl="https://github.com/emily", isActive=0),
]
db.add_all(students)
db.flush()

# Employers
employers = [
    Employer(companyName="TechCorp Solutions", contactEmail="hr@techcorp.com",
             industry="Technology", location="Dallas, TX",
             description="Leading cloud infrastructure provider building the future of digital services.",
             websiteUrl="https://techcorp.example.com"),
    Employer(companyName="DataVision Analytics", contactEmail="careers@datavision.com",
             industry="Data Analytics", location="Austin, TX",
             description="AI-powered analytics platform helping enterprises make data-driven decisions.",
             websiteUrl="https://datavision.example.com"),
    Employer(companyName="GreenEnergy Systems", contactEmail="jobs@greenenergy.com",
             industry="Energy", location="Houston, TX",
             description="Sustainable energy solutions for data centers and critical infrastructure.",
             websiteUrl="https://greenenergy.example.com"),
]
db.add_all(employers)
db.flush()

# Resources
resources = [
    Resource(title="iMasons Foundation", description="Learn more about the iMasons Foundation and our mission to shape the digital future.", url="https://imasons.org/"),
    Resource(title="LinkedIn - Infrastructure Masons", description="Connect with the iMasons community on LinkedIn.", url="https://www.linkedin.com/company/infrastructure-masons/"),
    Resource(title="Privacy Policy", description="Read our privacy policy to understand how we protect your data.", url="https://imasons.org/privacy-policy/"),
    Resource(title="GitHub - iMasons", description="Explore open-source projects and code repositories from the iMasons community.", url="https://github.com/imasons"),
    Resource(title="Career Resources", description="Access guides and resources for building a career in infrastructure and technology.", url="https://imasons.org/careers"),
]
db.add_all(resources)
db.flush()

# Job Postings with Custom Questions
postings_data = [
    {"employer": 0, "title": "Software Engineering Intern", "desc": "Join our engineering team to build scalable cloud services. You'll work on real production systems serving millions of users.", "location": "Dallas, TX", "jobType": "internship", "industry": "Technology",
     "questions": ["What programming languages are you most comfortable with?", "Describe a project you've built from scratch."]},
    {"employer": 0, "title": "Full Stack Developer", "desc": "Looking for a full stack developer to join our product team. You'll be building customer-facing features end-to-end.", "location": "Dallas, TX", "jobType": "full-time", "industry": "Technology",
     "questions": ["What's your experience with React and Node.js?", "How do you approach testing your code?"]},
    {"employer": 0, "title": "Cloud Architecture Mentor", "desc": "Mentor students on cloud architecture best practices, system design, and career growth in infrastructure.", "location": "Remote", "jobType": "mentorship", "industry": "Technology",
     "questions": ["What areas of cloud computing interest you most?"]},
    {"employer": 1, "title": "Data Science Intern", "desc": "Work with our data science team on machine learning models that power our analytics platform.", "location": "Austin, TX", "jobType": "internship", "industry": "Data Analytics",
     "questions": ["What ML frameworks have you used?", "Describe a data analysis project you've completed."]},
    {"employer": 1, "title": "Machine Learning Engineer", "desc": "Build and deploy machine learning models at scale. Experience with production ML systems preferred.", "location": "Austin, TX", "jobType": "full-time", "industry": "Data Analytics",
     "questions": ["Describe your experience with MLOps and model deployment."]},
    {"employer": 1, "title": "Part-time Data Analyst", "desc": "Help analyze customer usage patterns and generate insights for our product team. Flexible hours.", "location": "Remote", "jobType": "part-time", "industry": "Data Analytics",
     "questions": ["What visualization tools do you prefer and why?"]},
    {"employer": 2, "title": "Infrastructure Engineering Intern", "desc": "Help design and optimize energy-efficient data center infrastructure. Great for students interested in sustainable tech.", "location": "Houston, TX", "jobType": "internship", "industry": "Energy",
     "questions": ["Why are you interested in sustainable technology?", "What's your experience with infrastructure or hardware?"]},
    {"employer": 2, "title": "Systems Engineer", "desc": "Design and maintain critical infrastructure systems for our sustainable energy platform.", "location": "Houston, TX", "jobType": "full-time", "industry": "Energy",
     "questions": ["Describe your experience with Linux systems administration."]},
    {"employer": 2, "title": "Sustainability Mentor", "desc": "Guide students interested in the intersection of technology and sustainability. Share your industry experience.", "location": "Remote", "jobType": "mentorship", "industry": "Energy",
     "questions": ["What sustainability topics would you like to discuss?"]},
    {"employer": 0, "title": "DevOps Intern", "desc": "Learn and implement CI/CD pipelines, container orchestration, and infrastructure as code with our platform team.", "location": "Dallas, TX", "jobType": "internship", "industry": "Technology",
     "questions": ["What CI/CD tools have you used?", "Describe your experience with Docker or Kubernetes."]},
]

for pd in postings_data:
    posting = JobPosting(
        employerId=employers[pd["employer"]].id,
        title=pd["title"], description=pd["desc"],
        location=pd["location"], jobType=pd["jobType"], industry=pd["industry"],
        status="active", isActive=1,
    )
    db.add(posting)
    db.flush()
    for i, q in enumerate(pd["questions"]):
        db.add(CustomQuestion(jobPostingId=posting.id, questionText=q, questionOrder=i))

# --- User accounts for authentication ---
# Default password for all demo accounts: "Demo1234!"
# In production, each user sets their own password at registration.

DEMO_PASSWORD = "Demo1234!"

# Student user accounts (STU-0001 through STU-0005)
for i, student in enumerate(students):
    db.add(User(
        email=student.email,
        hashedPassword=hash_password(DEMO_PASSWORD),
        role="student",
        imasonsIdentifier=f"STU-{1001 + i:04d}",
        linkedProfileId=student.id,
    ))

# Employer user accounts (EMP-0001 through EMP-0003)
for i, employer in enumerate(employers):
    db.add(User(
        email=employer.contactEmail,
        hashedPassword=hash_password(DEMO_PASSWORD),
        role="employer",
        imasonsIdentifier=f"EMP-{1001 + i:04d}",
        linkedProfileId=employer.id,
    ))

# Admin account
db.add(User(
    email="admin@imasons.org",
    hashedPassword=hash_password(DEMO_PASSWORD),
    role="admin",
    imasonsIdentifier="ADM-0001",
    linkedProfileId=None,
))

# Sample analytics events
import random
all_postings = db.query(JobPosting).all()
all_students_db = db.query(Student).all()
for posting in all_postings:
    for _ in range(random.randint(2, 15)):
        db.add(AnalyticsEvent(eventType="posting_view", targetId=posting.id, viewerRole="student"))
    # Add some sample email_click events
    for _ in range(random.randint(0, 4)):
        db.add(AnalyticsEvent(eventType="email_click", targetId=posting.id, viewerRole="student"))
for student in all_students_db:
    for _ in range(random.randint(1, 8)):
        db.add(AnalyticsEvent(eventType="profile_view", targetId=student.id, viewerRole="employer"))

# Store emails before closing the session (ORM objects expire after close)
student_emails = [s.email for s in students]
employer_emails = [e.contactEmail for e in employers]

db.commit()
db.close()

print("Database seeded successfully!")
print(f"  - {len(students)} students")
print(f"  - {len(employers)} employers")
print(f"  - {len(postings_data)} job postings")
print(f"  - {len(students) + len(employers) + 1} user accounts")
print("  - Sample analytics events (including email_click events)")
print("")
print("Demo login credentials (all accounts use password: Demo1234!)")
print("  Students:")
for i, email in enumerate(student_emails):
    print(f"    {email}  |  iMasons ID: STU-{1001 + i:04d}")
print("  Employers:")
for i, email in enumerate(employer_emails):
    print(f"    {email}  |  iMasons ID: EMP-{1001 + i:04d}")
print("  Admin:")
print("    admin@imasons.org  |  iMasons ID: ADM-0001")
