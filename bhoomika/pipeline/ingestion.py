"""
Document Ingestion Pipeline
"""
import os
import uuid
from typing import List, Optional
from pypdf import PdfReader
import sys
sys.path.append('..')
from config import DOCUMENTS_DIR
from .chunking import chunk_document
from models import get_embeddings
from storage import get_faiss_store, get_sqlite_store, get_knowledge_graph


class DocumentIngestion:
    """
    Pipeline for ingesting documents into the RAG system
    """
    
    def __init__(self):
        self.embeddings = get_embeddings()
        self.faiss_store = get_faiss_store()
        self.sqlite_store = get_sqlite_store()
        self.knowledge_graph = get_knowledge_graph()
    
    def ingest_file(self, filepath: str, title: Optional[str] = None, 
                    description: Optional[str] = None) -> str:
        """
        Ingest a single file into the RAG system.
        Returns document ID.
        """
        # Determine file type
        filename = os.path.basename(filepath)
        extension = os.path.splitext(filename)[1].lower()
        
        # Extract text based on file type
        if extension == '.pdf':
            text = self._extract_pdf(filepath)
        elif extension in ['.txt', '.md']:
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            raise ValueError(f"Unsupported file type: {extension}")
        
        if not text or len(text.strip()) == 0:
            raise ValueError("No text content found in file")
        
        # Generate document ID
        doc_id = str(uuid.uuid4())[:8]
        
        # Store document metadata
        self.sqlite_store.add_document(
            doc_id=doc_id,
            filename=filename,
            filepath=filepath,
            doc_type=extension[1:],
            title=title or filename,
            description=description
        )
        
        # Chunk the document
        chunks = chunk_document(text)
        
        # Process chunks
        chunk_ids = []
        chunk_texts = []
        
        for i, (chunk_text, start_char, end_char) in enumerate(chunks):
            chunk_id = f"{doc_id}_chunk_{i}"
            chunk_ids.append(chunk_id)
            chunk_texts.append(chunk_text)
            
            # Store chunk metadata
            self.sqlite_store.add_chunk(
                chunk_id=chunk_id,
                document_id=doc_id,
                content=chunk_text,
                chunk_index=i,
                start_char=start_char,
                end_char=end_char
            )
        
        # Generate embeddings in batch
        embeddings = self.embeddings.embed_batch(chunk_texts)
        
        # Add to FAISS
        self.faiss_store.add_batch(chunk_ids, embeddings)
        
        # Build knowledge graph edges
        self.knowledge_graph.add_sequential_edges(chunk_ids, doc_id)
        
        # Add semantic edges based on embedding similarity
        self._add_semantic_edges(chunk_ids, embeddings)
        
        # Persist all stores
        self.faiss_store.save()
        self.knowledge_graph.save()
        
        return doc_id
    
    def ingest_text(self, text: str, title: str, description: Optional[str] = None) -> str:
        """
        Ingest raw text content.
        Returns document ID.
        """
        if not text or len(text.strip()) == 0:
            raise ValueError("Empty text content")
        
        doc_id = str(uuid.uuid4())[:8]
        
        # Store document metadata
        self.sqlite_store.add_document(
            doc_id=doc_id,
            filename=f"{title}.txt",
            doc_type='txt',
            title=title,
            description=description
        )
        
        # Chunk the text
        chunks = chunk_document(text)
        
        chunk_ids = []
        chunk_texts = []
        
        for i, (chunk_text, start_char, end_char) in enumerate(chunks):
            chunk_id = f"{doc_id}_chunk_{i}"
            chunk_ids.append(chunk_id)
            chunk_texts.append(chunk_text)
            
            self.sqlite_store.add_chunk(
                chunk_id=chunk_id,
                document_id=doc_id,
                content=chunk_text,
                chunk_index=i,
                start_char=start_char,
                end_char=end_char
            )
        
        # Generate embeddings
        embeddings = self.embeddings.embed_batch(chunk_texts)
        
        # Add to FAISS
        self.faiss_store.add_batch(chunk_ids, embeddings)
        
        # Build graph
        self.knowledge_graph.add_sequential_edges(chunk_ids, doc_id)
        self._add_semantic_edges(chunk_ids, embeddings)
        
        # Persist
        self.faiss_store.save()
        self.knowledge_graph.save()
        
        return doc_id
    
    def _extract_pdf(self, filepath: str) -> str:
        """Extract text from PDF"""
        reader = PdfReader(filepath)
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        return '\n'.join(text_parts)
    
    def _add_semantic_edges(self, chunk_ids: List[str], embeddings: List[List[float]]):
        """Add semantic similarity edges between chunks"""
        import numpy as np
        
        if len(chunk_ids) < 2:
            return
        
        # Calculate cosine similarity between embeddings
        emb_matrix = np.array(embeddings)
        norms = np.linalg.norm(emb_matrix, axis=1, keepdims=True)
        normalized = emb_matrix / norms
        similarity_matrix = np.dot(normalized, normalized.T)
        
        # Add edges for high similarity pairs
        for i in range(len(chunk_ids)):
            for j in range(i + 2, len(chunk_ids)):  # Skip adjacent chunks
                similarity = similarity_matrix[i][j]
                if similarity > 0.75:  # Threshold
                    self.knowledge_graph.add_semantic_edge(
                        chunk_ids[i], 
                        chunk_ids[j], 
                        float(similarity)
                    )
    
    def get_stats(self) -> dict:
        """Get ingestion statistics"""
        return {
            "documents": self.sqlite_store.count_documents(),
            "chunks": self.sqlite_store.count_chunks(),
            "vectors": self.faiss_store.count(),
            "graph_nodes": self.knowledge_graph.node_count(),
            "graph_edges": self.knowledge_graph.edge_count()
        }


def get_ingestion_pipeline() -> DocumentIngestion:
    return DocumentIngestion()
