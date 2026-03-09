import csv
import io
import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import Student, Class
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.crud import crud_student, crud_class

router = APIRouter(prefix="/students", tags=["students"])
logger = logging.getLogger(__name__)


# ─── Helper to build response with class_name ───
def _student_response(student: Student) -> dict:
    return {
        "student_id": student.student_id,
        "name": student.name,
        "birth_year": student.birth_year,
        "major": student.major,
        "gpa": student.gpa,
        "class_id": student.class_id,
        "class_name": student.class_rel.class_name if student.class_rel else "",
    }


# ─── CRUD ───

@router.get("", response_model=list[StudentResponse])
def list_students(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    students = crud_student.get_students(db, skip=skip, limit=limit)
    return [_student_response(s) for s in students]


@router.get("/statistics")
def get_statistics(db: Session = Depends(get_db)):
    """Return aggregated enrollment statistics."""
    total = db.query(func.count(Student.student_id)).scalar() or 0
    avg_gpa = db.query(func.avg(Student.gpa)).scalar()
    avg_gpa = round(avg_gpa, 2) if avg_gpa else 0.0

    major_counts = (
        db.query(Student.major, func.count(Student.student_id))
        .group_by(Student.major)
        .order_by(func.count(Student.student_id).desc())
        .all()
    )

    return {
        "total_students": total,
        "average_gpa": avg_gpa,
        "students_by_major": [
            {"major": major, "count": count} for major, count in major_counts
        ],
    }


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    """Export all students as a CSV file download."""
    students = crud_student.get_students(db, skip=0, limit=10000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        ["student_id", "name", "birth_year", "major", "gpa", "class_id", "class_name"]
    )
    for s in students:
        writer.writerow([
            s.student_id,
            s.name,
            s.birth_year,
            s.major,
            s.gpa,
            s.class_id,
            s.class_rel.class_name if s.class_rel else "",
        ])

    output.seek(0)
    filename = f"students_export_{date.today().isoformat()}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/template/csv")
def download_template():
    """Download a blank CSV template for import."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["student_id", "name", "birth_year", "major", "gpa", "class_id"])
    writer.writerow(["SV001", "Nguyen Van A", "2003", "Computer Science", "3.5", "C01"])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="students_import_template.csv"'
        },
    )


@router.post("/import/csv")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Import students from a CSV file with row-by-row validation."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a .csv file")

    content = await file.read()
    try:
        text = content.decode("utf-8-sig")  # Handle BOM from Excel
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))

    imported = 0
    errors: list[dict] = []

    for row_num, row in enumerate(reader, start=2):  # row 1 = header
        row = {k.strip(): v.strip() if v else "" for k, v in row.items() if k}

        # Check required fields
        missing = [
            f for f in ["student_id", "name", "birth_year", "major", "gpa", "class_id"]
            if not row.get(f)
        ]
        if missing:
            errors.append({
                "row": row_num,
                "student_id": row.get("student_id", ""),
                "reason": f"Missing required field(s): {', '.join(missing)}",
            })
            continue

        # Validate student_id uniqueness
        if crud_student.get_student(db, row["student_id"]):
            errors.append({
                "row": row_num,
                "student_id": row["student_id"],
                "reason": f"Student ID '{row['student_id']}' already exists",
            })
            continue

        # Validate class_id exists
        if not crud_class.get_class(db, row["class_id"]):
            errors.append({
                "row": row_num,
                "student_id": row["student_id"],
                "reason": f"Class ID '{row['class_id']}' not found in system",
            })
            continue

        # Validate birth_year
        try:
            birth_year = int(row["birth_year"])
            if birth_year < 1970 or birth_year > 2010:
                raise ValueError()
        except (ValueError, TypeError):
            errors.append({
                "row": row_num,
                "student_id": row["student_id"],
                "reason": f"Invalid birth year: '{row['birth_year']}' (must be 1970-2010)",
            })
            continue

        # Validate GPA
        try:
            gpa = float(row["gpa"])
            if gpa < 0.0 or gpa > 4.0:
                raise ValueError()
            gpa = round(gpa, 2)
        except (ValueError, TypeError):
            errors.append({
                "row": row_num,
                "student_id": row["student_id"],
                "reason": f"Invalid GPA: '{row['gpa']}' (must be 0.0-4.0)",
            })
            continue

        # Create student
        try:
            student_data = StudentCreate(
                student_id=row["student_id"],
                name=row["name"],
                birth_year=birth_year,
                major=row["major"],
                gpa=gpa,
                class_id=row["class_id"],
            )
            crud_student.create_student(db, student_data)
            imported += 1
        except Exception as e:
            errors.append({
                "row": row_num,
                "student_id": row["student_id"],
                "reason": str(e),
            })

    return {
        "imported": imported,
        "failed": len(errors),
        "errors": errors,
    }


@router.get("/{student_id}", response_model=StudentResponse)
def read_student(student_id: str, db: Session = Depends(get_db)):
    student = crud_student.get_student(db, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return _student_response(student)


@router.post("", response_model=StudentResponse, status_code=201)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    existing = crud_student.get_student(db, student.student_id)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Student ID '{student.student_id}' already exists",
        )
    # Validate class_id exists
    if not crud_class.get_class(db, student.class_id):
        raise HTTPException(
            status_code=400,
            detail=f"Class ID '{student.class_id}' not found",
        )
    created = crud_student.create_student(db, student)
    return _student_response(created)


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str, student: StudentUpdate, db: Session = Depends(get_db)
):
    # Validate class_id exists
    if not crud_class.get_class(db, student.class_id):
        raise HTTPException(
            status_code=400,
            detail=f"Class ID '{student.class_id}' not found",
        )
    updated = crud_student.update_student(db, student_id, student)
    if updated is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return _student_response(updated)


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: str, db: Session = Depends(get_db)):
    success = crud_student.delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
