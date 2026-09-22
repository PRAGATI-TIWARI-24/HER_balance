from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Database ka connection URL (ye herbalance.db naam ki file banayega)
SQLALCHEMY_DATABASE_URL = "sqlite:///./herbalance.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 2. Users Table: Jisme humari details save hongi
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)  # Password hide karke save karenge

# 3. Assessment History Table: Jisme test results save honge
class AssessmentHistory(Base):
    __tablename__ = "assessment_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    risk_flag = Column(Integer)
    probability = Column(Float)
    
# Database aur Tables automatically create karne ka command
Base.metadata.create_all(bind=engine)