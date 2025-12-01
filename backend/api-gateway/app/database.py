import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_DEFAULT_PATH = Path(__file__).resolve().parent / "app.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_DEFAULT_PATH}")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()

# FastAPI dependency

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
