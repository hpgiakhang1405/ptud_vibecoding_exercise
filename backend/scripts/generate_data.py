import os
import sys
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.models import Student, Class, Base
from app.db.database import engine, SessionLocal

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)


def generate_mock_data(num_students: int = 10):
    db: Session = SessionLocal()

    first_names = [
        "An",
        "Bình",
        "Châu",
        "Dương",
        "Đức",
        "Hải",
        "Khánh",
        "Linh",
        "Minh",
        "Ngọc",
        "Phong",
        "Quang",
        "Trang",
        "Tuấn",
        "Vy",
    ]
    last_names = [
        "Nguyễn",
        "Trần",
        "Lê",
        "Phạm",
        "Hoàng",
        "Huỳnh",
        "Phan",
        "Vũ",
        "Võ",
        "Đặng",
        "Bùi",
        "Đỗ",
    ]
    middle_names = [
        "Văn",
        "Thị",
        "Thanh",
        "Minh",
        "Hữu",
        "Gia",
        "Bảo",
        "Đức",
        "Ngọc",
        "Thu",
    ]

    majors = [
        "Computer Science",
        "Information Technology",
        "Software Engineering",
        "Data Science",
        "Artificial Intelligence",
        "Cybersecurity",
        "Network Engineering",
    ]

    existing_count = db.query(Student).count()
    if existing_count > 0:
        print(
            f"Database already contains {existing_count} records. Clearing exiting records..."
        )
        db.query(Student).delete()
        db.query(Class).delete()
        db.commit()

    print(f"Generating {num_students} mock student records...")

    class_ids = ["CLS01", "CLS02", "CLS03"]
    classes = [
        Class(class_id="CLS01", class_name="Lớp KTPM 01", advisor="Nguyễn Văn A"),
        Class(class_id="CLS02", class_name="Lớp MMT 02", advisor="Trần Thị B"),
        Class(class_id="CLS03", class_name="Lớp KHMT 03", advisor="Lê Văn C"),
    ]
    db.add_all(classes)

    for i in range(1, num_students + 1):
        # Format student ID nicely, e.g., SV001, SV010
        student_id = f"SV{i:03d}"

        # Generate a random Vietnamese name
        last = random.choice(last_names)
        mid = random.choice(middle_names)
        first = random.choice(first_names)
        full_name = f"{last} {mid} {first}"

        birth_year = random.randint(1998, 2005)
        major = random.choice(majors)
        # GPA rounded to 1 decimal place between 2.0 and 4.0
        gpa = round(random.uniform(2.0, 4.0), 1)

        new_student = Student(
            student_id=student_id,
            name=full_name,
            birth_year=birth_year,
            major=major,
            gpa=gpa,
            class_id=random.choice(class_ids),
        )

        db.add(new_student)

    try:
        db.commit()
        print("Successfully generated and saved mock data to the database!")
    except Exception as e:
        db.rollback()
        print(f"Error occurred: {repr(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    generate_mock_data(15)
