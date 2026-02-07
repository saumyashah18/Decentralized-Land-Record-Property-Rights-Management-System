"""
SQLite Store for Document and Chunk Metadata
"""
import os
from sqlalchemy import create_engine, Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import sys
sys.path.append('..')
from config import SQLITE_DB_PATH

Base = declarative_base()


class Document(Base):
    """Document table for storing source documents"""
    __tablename__ = 'documents'
    
    id = Column(String(50), primary_key=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500))
    doc_type = Column(String(50))  # pdf, txt, md, etc.
    title = Column(String(500))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")


class Chunk(Base):
    """Chunk table for storing document chunks"""
    __tablename__ = 'chunks'
    
    id = Column(String(100), primary_key=True)
    document_id = Column(String(50), ForeignKey('documents.id'), nullable=False)
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer)
    start_char = Column(Integer)
    end_char = Column(Integer)
    metadata = Column(Text)  # JSON string for additional metadata
    
    document = relationship("Document", back_populates="chunks")


class SQLiteStore:
    """
    SQLite store for document and chunk metadata
    """
    
    def __init__(self):
        os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
        self.engine = create_engine(f'sqlite:///{SQLITE_DB_PATH}')
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
    
    # Document operations
    def add_document(self, doc_id: str, filename: str, filepath: str = None, 
                     doc_type: str = None, title: str = None, description: str = None) -> Document:
        """Add a new document"""
        doc = Document(
            id=doc_id,
            filename=filename,
            filepath=filepath,
            doc_type=doc_type,
            title=title or filename,
            description=description
        )
        self.session.add(doc)
        self.session.commit()
        return doc
    
    def get_document(self, doc_id: str) -> Document:
        """Get document by ID"""
        return self.session.query(Document).filter_by(id=doc_id).first()
    
    def get_all_documents(self):
        """Get all documents"""
        return self.session.query(Document).all()
    
    def delete_document(self, doc_id: str):
        """Delete document and its chunks"""
        doc = self.get_document(doc_id)
        if doc:
            self.session.delete(doc)
            self.session.commit()
    
    # Chunk operations
    def add_chunk(self, chunk_id: str, document_id: str, content: str, 
                  chunk_index: int = 0, start_char: int = 0, end_char: int = 0,
                  metadata: str = None) -> Chunk:
        """Add a new chunk"""
        chunk = Chunk(
            id=chunk_id,
            document_id=document_id,
            content=content,
            chunk_index=chunk_index,
            start_char=start_char,
            end_char=end_char,
            metadata=metadata
        )
        self.session.add(chunk)
        self.session.commit()
        return chunk
    
    def get_chunk(self, chunk_id: str) -> Chunk:
        """Get chunk by ID"""
        return self.session.query(Chunk).filter_by(id=chunk_id).first()
    
    def get_chunks_by_document(self, document_id: str):
        """Get all chunks for a document"""
        return self.session.query(Chunk).filter_by(document_id=document_id).order_by(Chunk.chunk_index).all()
    
    def get_chunk_content(self, chunk_id: str) -> str:
        """Get chunk content by ID"""
        chunk = self.get_chunk(chunk_id)
        return chunk.content if chunk else ""
    
    def get_multiple_chunk_contents(self, chunk_ids: list) -> dict:
        """Get multiple chunk contents"""
        chunks = self.session.query(Chunk).filter(Chunk.id.in_(chunk_ids)).all()
        return {chunk.id: chunk.content for chunk in chunks}
    
    def count_chunks(self) -> int:
        """Count total chunks"""
        return self.session.query(Chunk).count()
    
    def count_documents(self) -> int:
        """Count total documents"""
        return self.session.query(Document).count()


# Singleton instance
_store = None

def get_sqlite_store() -> SQLiteStore:
    global _store
    if _store is None:
        _store = SQLiteStore()
    return _store
