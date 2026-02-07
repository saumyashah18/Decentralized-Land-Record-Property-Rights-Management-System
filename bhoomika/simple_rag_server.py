
"""
Simplified RAG Server for Bhoomika
Uses Local SentenceTransformers (BAAI/bge-large-en-v1.5) and Google Gemini (Generation).
"""
import os
import sys
import json
import pickle
import asyncio
import numpy as np
import requests
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from sqlalchemy import create_engine, Column, String, Text, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sentence_transformers import SentenceTransformer

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index")
SQLITE_DB_PATH = os.path.join(DATA_DIR, "bhoomika.db")

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
EMBEDDING_MODEL = "BAAI/bge-large-en-v1.5"

# Configure GenAI
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# --- DB & MODELS ---
Base = declarative_base()

class Chunk(Base):
    __tablename__ = 'chunks'
    id = Column(String(100), primary_key=True)
    document_id = Column(String(50), ForeignKey('documents.id'), nullable=False)
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer)

def get_db_session():
    engine = create_engine(f'sqlite:///{SQLITE_DB_PATH}')
    Session = sessionmaker(bind=engine)
    return Session()

# --- COMPONENTS ---
class LocalEmbeddings:
    def __init__(self):
        print(f"Loading local model {EMBEDDING_MODEL}...")
        self.model = SentenceTransformer(EMBEDDING_MODEL)

    def embed_query(self, text: str) -> List[float]:
        text = f"Represent this query for retrieving documents: {text}"
        try:
            embedding = self.model.encode(text, normalize_embeddings=True)
            return embedding.tolist()
        except Exception as e:
            print(f"Embedding failed: {e}")
            return []

class SimpleVectorStore:
    def __init__(self):
        self.index_path = os.path.join(FAISS_INDEX_PATH, "vectors.npy")
        self.id_map_path = os.path.join(FAISS_INDEX_PATH, "id_map.pkl")
        self.vectors = np.empty((0, 1024), dtype=np.float32) # 1024 dims
        self.id_to_chunk = {}
        self._load()

    def _load(self):
        if os.path.exists(self.index_path) and os.path.exists(self.id_map_path):
            try:
                self.vectors = np.load(self.index_path)
                with open(self.id_map_path, 'rb') as f:
                    data = pickle.load(f)
                    self.id_to_chunk = data['id_to_chunk']
            except: pass

    def search(self, query_embedding: List[float], top_k: int = 5) -> List[tuple]:
        if len(self.vectors) == 0 or not query_embedding:
            return []
        
        query_vec = np.array(query_embedding, dtype=np.float32)
        
        if query_vec.shape[0] != self.vectors.shape[1]:
            print(f"Dimension mismatch: Query {query_vec.shape[0]} vs Store {self.vectors.shape[1]}")
            return []

        norm_vecs = np.linalg.norm(self.vectors, axis=1)
        norm_query = np.linalg.norm(query_vec)
        
        if norm_query == 0: return []
        norm_vecs[norm_vecs == 0] = 1e-10
        
        sims = np.dot(self.vectors, query_vec) / (norm_vecs * norm_query)
        top_indices = np.argsort(sims)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if idx in self.id_to_chunk:
                results.append((self.id_to_chunk[idx], float(sims[idx])))
        return results

# --- FASTAPI APP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

embedder = LocalEmbeddings()
vector_store = SimpleVectorStore()

class ChatRequest(BaseModel):
    message: str
    stream: bool = False

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "bhoomika-rag-simple", "vectors": len(vector_store.vectors)}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    print(f"Query: {request.message}")
    
    # 1. Retrieve
    query_emb = embedder.embed_query(request.message)
    results = vector_store.search(query_emb, top_k=3)
    
    context = ""
    source_ids = []
    
    if results:
        chunk_ids = [r[0] for r in results]
        source_ids = chunk_ids
        
        session = get_db_session()
        chunks = session.query(Chunk).filter(Chunk.id.in_(chunk_ids)).all()
        session.close()
        
        chunk_map = {c.id: c.content for c in chunks}
        retrieved_texts = [chunk_map.get(cid, "") for cid in chunk_ids]
        
        context = "\n\n".join(retrieved_texts)
    
    print(f"Retrieved {len(results)} context chunks.")

    # 2. Generate
    system_prompt = f"""You are Bhoomika, an AI assistant for Indian land rights.
Use the following context to answer the user's question. If the answer is not in the context, say so, but you can provide general knowledge if relevant (mark it as general knowledge).
Keep answers concise and helpful.

Context:
{context}

User Question: {request.message}
"""

    if request.stream:
        from fastapi.responses import StreamingResponse
        async def response_generator():
            try:
                response = model.generate_content(system_prompt, stream=True)
                for chunk in response:
                    if chunk.text:
                        yield chunk.text
            except Exception as e:
                yield f"Error generating response: {e}"
        return StreamingResponse(response_generator(), media_type="text/plain")
    else:
        try:
            response = model.generate_content(system_prompt)
            return {"response": response.text, "sources": source_ids}
        except Exception as e:
            return {"response": f"Error: {e}", "sources": []}

if __name__ == "__main__":
    import uvicorn
    print("Starting Simplified RAG Server on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
