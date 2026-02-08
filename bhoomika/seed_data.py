
import os
import sys
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from sqlalchemy import create_engine, Column, String, Text, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uuid
from PyPDF2 import PdfReader

# --- CONFIG (Must match simple_rag_server.py) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index")
SQLITE_DB_PATH = os.path.join(DATA_DIR, "bhoomika.db")
DOCS_DIR = os.path.join(BASE_DIR, "documents")

EMBEDDING_MODEL = "BAAI/bge-large-en-v1.5"

# --- DB SETUP ---
Base = declarative_base()

class Document(Base):
    __tablename__ = 'documents'
    id = Column(String(50), primary_key=True)
    filename = Column(String(200))
    content = Column(Text)

class Chunk(Base):
    __tablename__ = 'chunks'
    id = Column(String(100), primary_key=True)
    document_id = Column(String(50), ForeignKey('documents.id'), nullable=False)
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer)
    chunk_type = Column(String(10), default='M')  # S, M, or L for multi-granularity

def init_db():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    engine = create_engine(f'sqlite:///{SQLITE_DB_PATH}')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()

# --- PROCESSING ---
def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def main():
    print(f"Initializing ingestion...")
    session = init_db()
    
    # 1. Load Model
    print(f"Loading model {EMBEDDING_MODEL}...")
    model = SentenceTransformer(EMBEDDING_MODEL)

    if not os.path.exists(FAISS_INDEX_PATH):
        os.makedirs(FAISS_INDEX_PATH)

    all_embeddings = []
    id_to_chunk = {}
    current_idx = 0

    # 2. Process Documents
    knowledge_base_dir = os.path.join(DOCS_DIR, "knowledge_base")
    if not os.path.exists(knowledge_base_dir):
        print(f"Knowledge base directory {knowledge_base_dir} not found.")
        return

    files = [f for f in os.listdir(knowledge_base_dir) if f.endswith(('.txt', '.pdf'))]
    print(f"Found {len(files)} documents.")

    for filename in files:
        filepath = os.path.join(knowledge_base_dir, filename)
        print(f"Processing {filename}...")
        
        # Extract content based on file type
        if filename.endswith('.pdf'):
            try:
                reader = PdfReader(filepath)
                content = ""
                for page in reader.pages:
                    content += page.extract_text() + "\n"
                print(f"  Extracted {len(reader.pages)} pages from PDF")
            except Exception as e:
                print(f"  Error reading PDF {filename}: {e}")
                continue
        else:  # .txt file
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

        doc_id = str(uuid.uuid4())[:8]
        doc_record = Document(id=doc_id, filename=filename, content=content)
        session.add(doc_record)

        chunks = chunk_text(content)
        for i, c_text in enumerate(chunks):
            chunk_id = f"{doc_id}_c{i}"
            
            # Save to DB
            chunk_record = Chunk(
                id=chunk_id,
                document_id=doc_id,
                content=c_text,
                chunk_index=i,
                chunk_type='M'
            )
            session.add(chunk_record)
            
            # Embed
            emb = model.encode(f"Represent this document for retrieval: {c_text}", normalize_embeddings=True)
            all_embeddings.append(emb)
            id_to_chunk[current_idx] = chunk_id
            current_idx += 1

    session.commit()
    print(f"Saved {current_idx} chunks to database.")

    # 3. Save Vectors
    if all_embeddings:
        vectors = np.array(all_embeddings, dtype=np.float32)
        np.save(os.path.join(FAISS_INDEX_PATH, "vectors.npy"), vectors)
        
        with open(os.path.join(FAISS_INDEX_PATH, "id_map.pkl"), 'wb') as f:
            pickle.dump({'id_to_chunk': id_to_chunk}, f)
        
        print(f"Saved vectors to {FAISS_INDEX_PATH}")
    else:
        print("No embeddings generated.")

if __name__ == "__main__":
    main()
