import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.db.models import Class
from app.api.routers import students, classes

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS using configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled error handling request {request.method} {request.url}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please contact support."},
    )


# Include routers
app.include_router(students.router, prefix="/api")
app.include_router(classes.router, prefix="/api")


# Seed sample classes on startup
@app.on_event("startup")
def seed_classes():
    """Auto-seed 3 sample classes if the classes table is empty."""
    db = SessionLocal()
    try:
        count = db.query(Class).count()
        if count == 0:
            sample_classes = [
                Class(class_id="C01", class_name="Computer Science 1", advisor="Nguyen Van A"),
                Class(class_id="C02", class_name="Software Engineering 1", advisor="Tran Thi B"),
                Class(class_id="C03", class_name="Information Systems 1", advisor="Le Van C"),
            ]
            db.add_all(sample_classes)
            db.commit()
            logger.info("Seeded 3 sample classes into the database.")
    finally:
        db.close()


@app.get("/health", tags=["system"])
def health_check():
    """Health check endpoint for container environments"""
    return {"status": "healthy", "version": settings.VERSION}
