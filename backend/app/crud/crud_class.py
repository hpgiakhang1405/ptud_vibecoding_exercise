from sqlalchemy.orm import Session
from app.db.models import Class
from app.schemas.class_schema import ClassCreate, ClassUpdate


def get_classes(db: Session) -> list[Class]:
    return db.query(Class).order_by(Class.class_id).all()


def get_class(db: Session, class_id: str) -> Class | None:
    return db.query(Class).filter(Class.class_id == class_id).first()


def create_class(db: Session, cls: ClassCreate) -> Class:
    db_class = Class(**cls.model_dump())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


def update_class(db: Session, class_id: str, cls: ClassUpdate) -> Class | None:
    db_class = get_class(db, class_id)
    if db_class is None:
        return None
    for key, value in cls.model_dump().items():
        setattr(db_class, key, value)
    db.commit()
    db.refresh(db_class)
    return db_class


def delete_class(db: Session, class_id: str) -> bool:
    db_class = get_class(db, class_id)
    if db_class is None:
        return False
    db.delete(db_class)
    db.commit()
    return True
