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
                    description: Optional[str] = None, use_multi_granularity: bool = True) -> str:
        """
        Ingest a single file into the RAG system.
        
        Args:
            filepath: Path to file
            title: Optional title
            description: Optional description
            use_multi_granularity: If True, use S/M/L chunking; if False, use legacy chunking
        
        Returns document ID.
        """
        from models.chunk_types import ChunkType
        from pipeline.chunking import chunk_document_multi_granularity
        
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
        
        if use_multi_granularity:
            # Multi-granularity chunking
            chunks_by_type = chunk_document_multi_granularity(text)
            
            all_chunk_ids = []
            all_chunk_texts = []
            embed_chunk_ids = []
            embed_chunk_texts = []
            
            chunk_counter = 0
            
            # Process each chunk type
            for chunk_type, chunks in chunks_by_type.items():
                for chunk_text, start_char, end_char in chunks:
                    chunk_id = f"{doc_id}_chunk_{chunk_counter}_{chunk_type.value}"
                    
                    # Store chunk metadata
                    self.sqlite_store.add_chunk(
                        chunk_id=chunk_id,
                        document_id=doc_id,
                        content=chunk_text,
                        chunk_index=chunk_counter,
                        chunk_type=chunk_type.value,
                        start_char=start_char,
                        end_char=end_char
                    )
                    
                    all_chunk_ids.append(chunk_id)
                    all_chunk_texts.append(chunk_text)
                    
                    # Only embed S and M chunks (L chunks are for context only)
                    if chunk_type in [ChunkType.SMALL, ChunkType.MEDIUM]:
                        embed_chunk_ids.append(chunk_id)
                        embed_chunk_texts.append(chunk_text)
                    
                    chunk_counter += 1
            
            # Generate embeddings for S and M chunks only
            if embed_chunk_texts:
                embeddings = self.embeddings.embed_batch(embed_chunk_texts)
                self.faiss_store.add_batch(embed_chunk_ids, embeddings)
            
            # Build knowledge graph
            self.knowledge_graph.add_sequential_edges(all_chunk_ids, doc_id)
            
            # Add keyword-based relations (deterministic)
            self.knowledge_graph.add_keyword_relations(all_chunk_ids, all_chunk_texts, doc_id)
            
            # Add semantic edges for embedded chunks
            if embed_chunk_texts and len(embed_chunk_texts) > 1:
                self._add_semantic_edges(embed_chunk_ids, embeddings)
        
        else:
            # Legacy chunking (backward compatibility)
            chunks = chunk_document(text)
            
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
                    chunk_type='M',  # Default to medium
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
        
        # Persist all stores
        self.faiss_store.save()
        self.knowledge_graph.save()
        
        return doc_id
    
    def ingest_text(self, text: str, title: str, description: Optional[str] = None,
                    use_multi_granularity: bool = True) -> str:
        """
        Ingest raw text content.
        
        Args:
            text: Text content
            title: Document title
            description: Optional description
            use_multi_granularity: If True, use S/M/L chunking
        
        Returns document ID.
        """
        from models.chunk_types import ChunkType
        from pipeline.chunking import chunk_document_multi_granularity
        
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
        
        if use_multi_granularity:
            # Multi-granularity chunking
            chunks_by_type = chunk_document_multi_granularity(text)
            
            all_chunk_ids = []
            all_chunk_texts = []
            embed_chunk_ids = []
            embed_chunk_texts = []
            
            chunk_counter = 0
            
            for chunk_type, chunks in chunks_by_type.items():
                for chunk_text, start_char, end_char in chunks:
                    chunk_id = f"{doc_id}_chunk_{chunk_counter}_{chunk_type.value}"
                    
                    self.sqlite_store.add_chunk(
                        chunk_id=chunk_id,
                        document_id=doc_id,
                        content=chunk_text,
                        chunk_index=chunk_counter,
                        chunk_type=chunk_type.value,
                        start_char=start_char,
                        end_char=end_char
                    )
                    
                    all_chunk_ids.append(chunk_id)
                    all_chunk_texts.append(chunk_text)
                    
                    if chunk_type in [ChunkType.SMALL, ChunkType.MEDIUM]:
                        embed_chunk_ids.append(chunk_id)
                        embed_chunk_texts.append(chunk_text)
                    
                    chunk_counter += 1
            
            # Embed S and M chunks
            if embed_chunk_texts:
                embeddings = self.embeddings.embed_batch(embed_chunk_texts)
                self.faiss_store.add_batch(embed_chunk_ids, embeddings)
            
            # Build graph
            self.knowledge_graph.add_sequential_edges(all_chunk_ids, doc_id)
            self.knowledge_graph.add_keyword_relations(all_chunk_ids, all_chunk_texts, doc_id)
            
            if embed_chunk_texts and len(embed_chunk_texts) > 1:
                self._add_semantic_edges(embed_chunk_ids, embeddings)
        
        else:
            # Legacy chunking
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
                    chunk_type='M',
                    start_char=start_char,
                    end_char=end_char
                )
            
            embeddings = self.embeddings.embed_batch(chunk_texts)
            self.faiss_store.add_batch(chunk_ids, embeddings)
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
