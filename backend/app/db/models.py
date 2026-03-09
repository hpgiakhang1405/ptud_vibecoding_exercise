from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Class(Base):
    __tablename__ = "classes"

    class_id = Column(String(50), primary_key=True, index=True)
    class_name = Column(String(255), nullable=False)
    advisor = Column(String(255), nullable=False)

    students = relationship("Student", back_populates="class_rel", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    student_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    birth_year = Column(Integer, nullable=False)
    major = Column(String(255), nullable=False)
    gpa = Column(Float, nullable=False)
    class_id = Column(String(50), ForeignKey("classes.class_id"), nullable=False)

    class_rel = relationship("Class", back_populates="students")
