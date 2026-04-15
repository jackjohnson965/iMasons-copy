"""
migrate.py — One-time database migration script.

Run ONCE against an existing imasons.db to:
1. Add the `status` column to job_postings and back-fill from isActive
2. Create the `users` table for authentication
3. Recreate analytics_events with the updated CheckConstraint (adds email_click)

Safe to run multiple times — each step checks if the change already exists.

Usage:
    cd backend
    python migrate.py
"""
import sqlite3
import sys
import os

DB_PATH = os.environ.get("DATABASE_URL", "./imasons.db").replace("sqlite:///", "")


def column_exists(cursor, table: str, column: str) -> bool:
    """Check if a column exists in a SQLite table."""
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())


def table_exists(cursor, table: str) -> bool:
    """Check if a table exists in the SQLite database."""
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)
    )
    return cursor.fetchone() is not None


def migrate_job_posting_status(cursor):
    """Add `status` column to job_postings and back-fill from isActive."""
    if not column_exists(cursor, "job_postings", "status"):
        print("  [job_postings] Adding status column...")
        cursor.execute(
            "ALTER TABLE job_postings ADD COLUMN status TEXT NOT NULL DEFAULT 'active'"
        )
        # Back-fill: isActive=1 → 'active', isActive=0 → 'closed'
        cursor.execute(
            "UPDATE job_postings SET status = CASE WHEN isActive = 1 THEN 'active' ELSE 'closed' END"
        )
        print("  [job_postings] status column added and back-filled.")
    else:
        print("  [job_postings] status column already exists, skipping.")


def migrate_users_table(cursor):
    """Create the users table for JWT authentication."""
    if not table_exists(cursor, "users"):
        print("  [users] Creating users table...")
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                hashedPassword TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('student', 'employer', 'admin')),
                imasonsIdentifier TEXT NOT NULL UNIQUE,
                linkedProfileId INTEGER,
                createdAt TEXT DEFAULT (datetime('now'))
            )
        """)
        print("  [users] Table created.")
    else:
        print("  [users] Table already exists, skipping.")


def migrate_analytics_events_constraint(cursor):
    """
    Recreate analytics_events table to add 'email_click' to the CheckConstraint.

    SQLite does not support ALTER TABLE for constraints, so the safe pattern is:
    1. Create a new table with the updated constraint
    2. Copy all existing data
    3. Drop the old table
    4. Rename the new table

    This is wrapped in a transaction so it's atomic.
    """
    # Check if the constraint already includes email_click by trying the canonical approach
    # Inspect the existing table's CREATE statement
    cursor.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='analytics_events'"
    )
    row = cursor.fetchone()
    if row and "email_click" in row[0]:
        print("  [analytics_events] email_click already in constraint, skipping.")
        return

    print("  [analytics_events] Recreating table to add email_click constraint...")
    cursor.executescript("""
        BEGIN;

        CREATE TABLE analytics_events_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            eventType TEXT NOT NULL CHECK(eventType IN ('profile_view', 'posting_view', 'email_click')),
            targetId INTEGER NOT NULL,
            viewerRole TEXT DEFAULT '',
            createdAt TEXT DEFAULT (datetime('now'))
        );

        INSERT INTO analytics_events_new (id, eventType, targetId, viewerRole, createdAt)
        SELECT id, eventType, targetId, viewerRole, createdAt FROM analytics_events;

        DROP TABLE analytics_events;

        ALTER TABLE analytics_events_new RENAME TO analytics_events;

        COMMIT;
    """)
    print("  [analytics_events] Table recreated with email_click support.")


def migrate_resources_table(cursor):
    """Create the resources table for managing resource links."""
    if not table_exists(cursor, "resources"):
        print("  [resources] Creating resources table...")
        cursor.execute("""
            CREATE TABLE resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                url TEXT NOT NULL,
                createdAt TEXT DEFAULT (datetime('now')),
                updatedAt TEXT DEFAULT (datetime('now'))
            )
        """)
        print("  [resources] Table created.")
    else:
        print("  [resources] Table already exists, skipping.")


def migrate_student_profile_image_link(cursor):
    """Add `profileImageLink` column to students when missing."""
    if not column_exists(cursor, "students", "profileImageLink"):
        print("  [students] Adding profileImageLink column...")
        cursor.execute(
            "ALTER TABLE students ADD COLUMN profileImageLink TEXT NOT NULL DEFAULT ''"
        )
        print("  [students] profileImageLink column added.")
    else:
        print("  [students] profileImageLink column already exists, skipping.")


def run_migration():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}.")
        print("This is fine if you're starting fresh — SQLAlchemy will create all tables.")
        print("No migration needed for a fresh install.")
        return

    print(f"Starting iMasons database migration on: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        migrate_job_posting_status(cursor)
        conn.commit()

        migrate_users_table(cursor)
        conn.commit()

        # analytics_events recreation uses its own transaction via executescript
        migrate_analytics_events_constraint(cursor)

        migrate_resources_table(cursor)
        conn.commit()

        migrate_student_profile_image_link(cursor)
        conn.commit()

        print("\nMigration complete. All steps succeeded.")
    except Exception as e:
        conn.rollback()
        print(f"\nMigration failed: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    run_migration()
