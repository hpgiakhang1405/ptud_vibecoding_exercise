from sqlalchemy.orm import Session, joinedload
from app.db.models import Student
from app.schemas.student import StudentCreate, StudentUpdate


def get_students(db: Session, skip: int = 0, limit: int = 100) -> list[Student]:
    return (
        db.query(Student)
        .options(joinedload(Student.class_rel))
        .order_by(Student.student_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_student(db: Session, student_id: str) -> Student | None:
    return (
        db.query(Student)
        .options(joinedload(Student.class_rel))
        .filter(Student.student_id == student_id)
        .first()
    )


def create_student(db: Session, student: StudentCreate) -> Student:
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    # Eagerly load the relationship
    db.refresh(db_student, attribute_names=["class_rel"])
    return db_student


def update_student(
    db: Session, student_id: str, student: StudentUpdate
) -> Student | None:
    db_student = get_student(db, student_id)
    if db_student is None:
        return None
    for key, value in student.model_dump().items():
        setattr(db_student, key, value)
    db.commit()
    db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: str) -> bool:
    db_student = get_student(db, student_id)
    if db_student is None:
        return False
    db.delete(db_student)
    db.commit()
    return True
