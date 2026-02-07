
"""
Standalone Ingestion Script for Bhoomika
Bypasses all internal package imports to avoid environment issues on Windows.
Uses Local SentenceTransformers (BAAI/bge-large-en-v1.5) (1024 dim).
"""
import os
import sys
import uuid
import json
import shutil
import pickle
import time
import numpy as np
from typing import List, Tuple, Dict, Any
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sentence_transformers import SentenceTransformer

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DOCUMENTS_DIR = os.path.join(DATA_DIR, "documents")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index")
SQLITE_DB_PATH = os.path.join(DATA_DIR, "bhoomika.db")

# Model Config
from dotenv import load_dotenv
load_dotenv()
EMBEDDING_MODEL = "BAAI/bge-large-en-v1.5"


# Chunking Config
CHUNK_SIZE = 512
CHUNK_OVERLAP = 50
BATCH_SIZE = 16 

# --- DATABASE SETUP ---
Base = declarative_base()

class Document(Base):
    __tablename__ = 'documents'
    id = Column(String(50), primary_key=True)
    filename = Column(String(255), nullable=False)
    doc_type = Column(String(50))
    title = Column(String(500))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Chunk(Base):
    __tablename__ = 'chunks'
    id = Column(String(100), primary_key=True)
    document_id = Column(String(50), ForeignKey('documents.id'), nullable=False)
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer)

def init_db():
    os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
    engine = create_engine(f'sqlite:///{SQLITE_DB_PATH}')
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()

# --- CHUNKER ---
class TextChunker:
    def __init__(self, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = overlap

    def chunk_text(self, text: str) -> List[Tuple[str, int, int]]:
        if not text: return []
        sentences = text.replace('\n', ' ').split('. ')
        chunks = []
        current_chunk = []
        current_len = 0
        
        for sentence in sentences:
            slen = len(sentence)
            if current_len + slen > self.chunk_size:
                text_chunk = '. '.join(current_chunk) + '.'
                chunks.append((text_chunk, 0, 0))
                current_chunk = [current_chunk[-1]] if current_chunk else []
                current_len = len(current_chunk[0]) if current_chunk else 0
            
            current_chunk.append(sentence)
            current_len += slen
        
        if current_chunk:
            chunks.append(('. '.join(current_chunk) + '.', 0, 0))
            
        return chunks

# --- EMBEDDING ---
class LocalEmbeddings:
    def __init__(self):
        print(f"Loading local model {EMBEDDING_MODEL}...")
        self.model = SentenceTransformer(EMBEDDING_MODEL)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        try:
            # SentenceTransformers encodes list[str] -> ndarray or list[tensor]
            embeddings = self.model.encode(texts, normalize_embeddings=True)
            return embeddings.tolist()
        except Exception as e:
            print(f"  Batch exception: {e}")
            return []

# --- VECTOR STORE ---
class SimpleVectorStore:
    def __init__(self):
        self.index_path = os.path.join(FAISS_INDEX_PATH, "vectors.npy")
        self.id_map_path = os.path.join(FAISS_INDEX_PATH, "id_map.pkl")
        self.vectors = np.empty((0, 1024), dtype=np.float32) # 1024 dims
        self.id_to_chunk = {}
        self.current_id = 0
        self._load()

    def _load(self):
        if os.path.exists(self.index_path) and os.path.exists(self.id_map_path):
            try:
                self.vectors = np.load(self.index_path)
                with open(self.id_map_path, 'rb') as f:
                    data = pickle.load(f)
                    self.id_to_chunk = data['id_to_chunk']
                    self.current_id = data.get('current_id', 0)
            except: pass

    def add_batch(self, chunk_ids: List[str], embeddings: List[List[float]]):
        if not embeddings: return
        
        valid_indices = [i for i, e in enumerate(embeddings) if len(e) == 1024]
        if not valid_indices: return

        valid_embeddings = [embeddings[i] for i in valid_indices]
        valid_ids = [chunk_ids[i] for i in valid_indices]

        new_vecs = np.array(valid_embeddings, dtype=np.float32)
        
        if self.vectors.shape[1] != new_vecs.shape[1]:
            print(f"  Dimension mismatch (Stored: {self.vectors.shape[1]}, New: {new_vecs.shape[1]}). Resetting store.")
            self.vectors = np.empty((0, new_vecs.shape[1]), dtype=np.float32)
            self.id_to_chunk = {}
            self.current_id = 0

        self.vectors = np.vstack([self.vectors, new_vecs])
        
        for cid in valid_ids:
            internal_id = self.current_id
            self.id_to_chunk[internal_id] = cid
            self.current_id += 1

    def save(self):
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        np.save(self.index_path, self.vectors)
        with open(self.id_map_path, 'wb') as f:
            pickle.dump({
                'id_to_chunk': self.id_to_chunk,
                'current_id': self.current_id
            }, f)

# --- MAIN INGESTION ---
def process_documents():
    print(f"Scanning {DOCUMENTS_DIR}...")
    files = [f for f in os.listdir(DOCUMENTS_DIR) if f.lower().endswith('.pdf')]
    if not files:
        print("No PDF files found.")
        return

    session = init_db()
    chunker = TextChunker()
    embedder = LocalEmbeddings()
    vector_store = SimpleVectorStore()

    import pypdf

    for filename in files:
        print(f"Processing {filename}...")
        filepath = os.path.join(DOCUMENTS_DIR, filename)
        
        try:
            reader = pypdf.PdfReader(filepath)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            if not text.strip(): continue

            doc_id = str(uuid.uuid4())
            doc = Document(id=doc_id, filename=filename, title=filename, doc_type='pdf')
            session.add(doc)
            session.commit()

            raw_chunks = chunker.chunk_text(text)
            print(f"Created {len(raw_chunks)} chunks.")

            all_embeddings = []
            chunk_ids = []
            
            for i in range(0, len(raw_chunks), BATCH_SIZE):
                batch = raw_chunks[i:i + BATCH_SIZE]
                batch_texts = [c[0] for c in batch]
                
                print(f"  Embedding batch {i // BATCH_SIZE + 1} ({len(batch_texts)} items)...")
                embeddings = embedder.embed_batch(batch_texts)
                all_embeddings.extend(embeddings)
                
                for j, (chunk_text, _, _) in enumerate(batch):
                    global_idx = i + j
                    chunk_id = f"{doc_id}_{global_idx}"
                    chunk = Chunk(
                        id=chunk_id,
                        document_id=doc_id,
                        content=chunk_text,
                        chunk_index=global_idx
                    )
                    session.add(chunk)
                    chunk_ids.append(chunk_id)
                session.commit()
                # No sleep needed for local

            print(f"Saving {len(all_embeddings)} vectors...")
            vector_store.add_batch(chunk_ids, all_embeddings)
            vector_store.save()

            os.makedirs(PROCESSED_DIR, exist_ok=True)
            shutil.move(filepath, os.path.join(PROCESSED_DIR, filename))
            print("Done.")

        except Exception as e:
            print(f"Error processing {filename}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    process_documents()
