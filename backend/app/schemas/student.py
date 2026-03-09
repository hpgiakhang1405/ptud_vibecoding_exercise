from pydantic import BaseModel, Field, field_validator


class StudentCreate(BaseModel):
    student_id: str = Field(
        ..., min_length=1, max_length=50, description="Unique student identifier"
    )
    name: str = Field(
        ..., min_length=1, max_length=255, description="Full name of the student"
    )
    birth_year: int = Field(
        ..., ge=1970, le=2010, description="Year of birth (1970-2010)"
    )
    major: str = Field(
        ..., min_length=1, max_length=255, description="Academic program name"
    )
    gpa: float = Field(..., ge=0.0, le=4.0, description="GPA on 4.0 scale")
    class_id: str = Field(
        ..., min_length=1, max_length=50, description="Class identifier"
    )

    @field_validator("student_id", "name", "major", "class_id")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()

    @field_validator("gpa")
    @classmethod
    def round_gpa(cls, v: float) -> float:
        return round(v, 2)


class StudentUpdate(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=255, description="Full name of the student"
    )
    birth_year: int = Field(
        ..., ge=1970, le=2010, description="Year of birth (1970-2010)"
    )
    major: str = Field(
        ..., min_length=1, max_length=255, description="Academic program name"
    )
    gpa: float = Field(..., ge=0.0, le=4.0, description="GPA on 4.0 scale")
    class_id: str = Field(
        ..., min_length=1, max_length=50, description="Class identifier"
    )

    @field_validator("name", "major", "class_id")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()

    @field_validator("gpa")
    @classmethod
    def round_gpa(cls, v: float) -> float:
        return round(v, 2)


class StudentResponse(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float
    class_id: str
    class_name: str = ""

    model_config = {"from_attributes": True}
