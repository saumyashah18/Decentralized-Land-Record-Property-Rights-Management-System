"""
Bhoomika AI Assistant - FastAPI Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import HOST, PORT, CORS_ORIGINS
from api.routes import router

app = FastAPI(
    title="Bhoomika AI Assistant",
    description="AI-powered legal assistant for Indian land and property rights",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "Bhoomika AI Assistant",
        "status": "active",
        "description": "Your guide to Indian land and property rights"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True
    )
