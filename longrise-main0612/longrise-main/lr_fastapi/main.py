"""
Longrise AI FastAPI Application
Main entry point for the API server
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings
from app.core.database import async_session_maker, create_db_and_tables, close_db_connection
from app.services.user_service import UserService

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description=settings.PROJECT_DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS setup — development gets hardcoded localhost; other envs require explicit config
if settings.is_development:
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        *settings.BACKEND_CORS_ORIGINS,
    ]
else:
    # Non-development: must have explicit origins. Settings validator already
    # enforces this at startup, so we never reach here with an empty list.
    cors_origins = list(settings.BACKEND_CORS_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print(f"CORS origins ({settings.ENVIRONMENT}): {cors_origins}")


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    # Create database tables
    await create_db_and_tables()
    async with async_session_maker() as session:
        await UserService.ensure_all_referral_codes(session)


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    # Close database connection
    await close_db_connection()


@app.get("/", tags=["root"])
async def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to Longrise AI API",
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
