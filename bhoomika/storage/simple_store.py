"""
Simple In-Memory Vector Store (NumPy-based)
Fallback if FAISS is not available
"""
import os
import numpy as np
import pickle
from typing import List, Tuple
import sys
sys.path.append('..')
from config import FAISS_INDEX_PATH, EMBEDDING_DIMENSION, TOP_K_RESULTS


class SimpleVectorStore:
    """
    Simple in-memory vector store using NumPy for cosine similarity
    """
    
    def __init__(self):
        self.dimension = EMBEDDING_DIMENSION
        self.index_path = os.path.join(FAISS_INDEX_PATH, "vectors.npy")
        self.id_map_path = os.path.join(FAISS_INDEX_PATH, "id_map.pkl")
        
        # ID to chunk mapping
        self.id_to_chunk = {}
        self.chunk_to_id = {}
        self.current_id = 0
        
        # Vectors storage
        self.vectors = np.empty((0, self.dimension), dtype=np.float32)
        
        # Load or create
        self._load_or_create_index()
    
    def _load_or_create_index(self):
        """Load existing vectors or initialize empty"""
        if os.path.exists(self.index_path) and os.path.exists(self.id_map_path):
            try:
                self.vectors = np.load(self.index_path)
                with open(self.id_map_path, 'rb') as f:
                    data = pickle.load(f)
                    self.id_to_chunk = data['id_to_chunk']
                    self.chunk_to_id = data['chunk_to_id']
                    self.current_id = data['current_id']
            except Exception as e:
                print(f"Error loading index: {e}")
                self.vectors = np.empty((0, self.dimension), dtype=np.float32)
    
    def add(self, chunk_id: str, embedding: List[float]) -> int:
        """Add embedding"""
        if chunk_id in self.chunk_to_id:
            return self.chunk_to_id[chunk_id]
        
        # Add vector
        vector = np.array([embedding], dtype=np.float32)
        self.vectors = np.vstack([self.vectors, vector])
        
        # Map IDs
        internal_id = self.current_id
        self.id_to_chunk[internal_id] = chunk_id
        self.chunk_to_id[chunk_id] = internal_id
        self.current_id += 1
        
        return internal_id
    
    def add_batch(self, chunk_ids: List[str], embeddings: List[List[float]]) -> List[int]:
        """Add multiple embeddings"""
        ids = []
        new_vectors = np.array(embeddings, dtype=np.float32)
        
        if len(new_vectors) > 0:
            self.vectors = np.vstack([self.vectors, new_vectors])
            
            for chunk_id in chunk_ids:
                internal_id = self.current_id
                self.id_to_chunk[internal_id] = chunk_id
                self.chunk_to_id[chunk_id] = internal_id
                self.current_id += 1
                ids.append(internal_id)
                
        return ids
    
    def search(self, query_embedding: List[float], top_k: int = TOP_K_RESULTS) -> List[Tuple[str, float]]:
        """Cosine similarity search"""
        if len(self.vectors) == 0:
            return []
        
        query_vector = np.array(query_embedding, dtype=np.float32)
        
        # Normalize vectors for cosine similarity
        norm_vectors = np.linalg.norm(self.vectors, axis=1)
        norm_query = np.linalg.norm(query_vector)
        
        if norm_query == 0:
            return []
        
        # Cosine similarity
        similarities = np.dot(self.vectors, query_vector) / (norm_vectors * norm_query)
        
        # Get top-k indices
        top_k_indices = np.argsort(similarities)[-top_k:][::-1]
        
        results = []
        for idx in top_k_indices:
            similarity = similarities[idx]
            if idx in self.id_to_chunk:
                results.append((self.id_to_chunk[idx], float(similarity)))
        
        return results
    
    def save(self):
        """Persist vectors and mappings"""
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        np.save(self.index_path, self.vectors)
        
        with open(self.id_map_path, 'wb') as f:
            pickle.dump({
                'id_to_chunk': self.id_to_chunk,
                'chunk_to_id': self.chunk_to_id,
                'current_id': self.current_id
            }, f)
    
    def count(self) -> int:
        return len(self.vectors)

# Singleton instance
_store = None

def get_faiss_store():
    global _store
    if _store is None:
        _store = SimpleVectorStore()
    return _store
