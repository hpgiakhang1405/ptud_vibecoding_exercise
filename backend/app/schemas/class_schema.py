from pydantic import BaseModel, Field, field_validator


class ClassCreate(BaseModel):
    class_id: str = Field(
        ..., min_length=1, max_length=50, description="Unique class identifier"
    )
    class_name: str = Field(
        ..., min_length=1, max_length=255, description="Full name of the class"
    )
    advisor: str = Field(
        ..., min_length=1, max_length=255, description="Advisor full name"
    )

    @field_validator("class_id", "class_name", "advisor")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()


class ClassUpdate(BaseModel):
    class_name: str = Field(
        ..., min_length=1, max_length=255, description="Full name of the class"
    )
    advisor: str = Field(
        ..., min_length=1, max_length=255, description="Advisor full name"
    )

    @field_validator("class_name", "advisor")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()


class ClassResponse(BaseModel):
    class_id: str
    class_name: str
    advisor: str

    model_config = {"from_attributes": True}
