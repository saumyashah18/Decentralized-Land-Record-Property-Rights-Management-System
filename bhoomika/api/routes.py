"""
Bhoomika AI Assistant - API Routes
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import tempfile

import sys
sys.path.append('..')
from pipeline import get_ingestion_pipeline, get_retrieval_pipeline
from models import get_gemini_client


router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    stream: bool = True


class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []


class IngestTextRequest(BaseModel):
    title: str
    content: str
    description: Optional[str] = None


class StatsResponse(BaseModel):
    documents: int
    chunks: int
    vectors: int
    graph_nodes: int
    graph_edges: int


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat with Bhoomika AI assistant
    """
    try:
        retrieval = get_retrieval_pipeline()
        gemini = get_gemini_client()
        
        # Retrieve relevant context
        results = retrieval.retrieve(request.message)
        context = retrieval.build_context(results)
        
        if request.stream:
            # Streaming response
            def generate():
                for chunk in gemini.generate_stream(request.message, context):
                    yield chunk
            
            return StreamingResponse(
                generate(),
                media_type="text/plain"
            )
        else:
            # Non-streaming response
            response_text = gemini.generate(request.message, context)
            sources = [r['chunk_id'] for r in results]
            
            return ChatResponse(response=response_text, sources=sources)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest/file")
async def ingest_file(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    description: Optional[str] = None
):
    """
    Ingest a document file (PDF, TXT, MD)
    """
    try:
        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            ingestion = get_ingestion_pipeline()
            doc_id = ingestion.ingest_file(
                tmp_path,
                title=title or file.filename,
                description=description
            )
            
            return {
                "success": True,
                "document_id": doc_id,
                "filename": file.filename,
                "stats": ingestion.get_stats()
            }
        finally:
            os.unlink(tmp_path)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest/text")
async def ingest_text(request: IngestTextRequest):
    """
    Ingest raw text content
    """
    try:
        ingestion = get_ingestion_pipeline()
        doc_id = ingestion.ingest_text(
            request.content,
            title=request.title,
            description=request.description
        )
        
        return {
            "success": True,
            "document_id": doc_id,
            "title": request.title,
            "stats": ingestion.get_stats()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """
    Get ingestion statistics
    """
    try:
        ingestion = get_ingestion_pipeline()
        stats = ingestion.get_stats()
        return StatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "bhoomika"}
