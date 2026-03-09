from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.class_schema import ClassCreate, ClassUpdate, ClassResponse
from app.crud import crud_class

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("", response_model=list[ClassResponse])
def list_classes(db: Session = Depends(get_db)):
    return crud_class.get_classes(db)


@router.get("/{class_id}", response_model=ClassResponse)
def read_class(class_id: str, db: Session = Depends(get_db)):
    cls = crud_class.get_class(db, class_id)
    if cls is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return cls


@router.post("", response_model=ClassResponse, status_code=201)
def create_class(cls: ClassCreate, db: Session = Depends(get_db)):
    existing = crud_class.get_class(db, cls.class_id)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Class ID '{cls.class_id}' already exists",
        )
    return crud_class.create_class(db, cls)


@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: str, cls: ClassUpdate, db: Session = Depends(get_db)
):
    updated = crud_class.update_class(db, class_id, cls)
    if updated is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return updated


@router.delete("/{class_id}", status_code=204)
def delete_class(class_id: str, db: Session = Depends(get_db)):
    success = crud_class.delete_class(db, class_id)
    if not success:
        raise HTTPException(status_code=404, detail="Class not found")
