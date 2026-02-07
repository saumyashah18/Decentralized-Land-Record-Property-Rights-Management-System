"""
FAISS HNSW Vector Store for Embedding Storage
"""
import os
import faiss
import numpy as np
from typing import List, Tuple, Optional
import pickle
import sys
sys.path.append('..')
from config import FAISS_INDEX_PATH, EMBEDDING_DIMENSION, TOP_K_RESULTS


class FAISSStore:
    """
    FAISS HNSW index for fast approximate nearest neighbor search
    """
    
    def __init__(self):
        self.dimension = EMBEDDING_DIMENSION
        self.index_path = os.path.join(FAISS_INDEX_PATH, "index.faiss")
        self.id_map_path = os.path.join(FAISS_INDEX_PATH, "id_map.pkl")
        
        # ID to chunk mapping
        self.id_to_chunk = {}
        self.chunk_to_id = {}
        self.current_id = 0
        
        # Load or create index
        self._load_or_create_index()
    
    def _load_or_create_index(self):
        """Load existing index or create new HNSW index"""
        if os.path.exists(self.index_path) and os.path.exists(self.id_map_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.id_map_path, 'rb') as f:
                data = pickle.load(f)
                self.id_to_chunk = data['id_to_chunk']
                self.chunk_to_id = data['chunk_to_id']
                self.current_id = data['current_id']
        else:
            # Create HNSW index with 32 links per node
            self.index = faiss.IndexHNSWFlat(self.dimension, 32)
            # Set efConstruction for build-time accuracy
            self.index.hnsw.efConstruction = 128
            # Set efSearch for query-time accuracy
            self.index.hnsw.efSearch = 64
    
    def add(self, chunk_id: str, embedding: List[float]) -> int:
        """Add embedding with associated chunk ID"""
        if chunk_id in self.chunk_to_id:
            return self.chunk_to_id[chunk_id]
        
        # Convert to numpy array
        vector = np.array([embedding], dtype=np.float32)
        
        # Add to index
        self.index.add(vector)
        
        # Map IDs
        internal_id = self.current_id
        self.id_to_chunk[internal_id] = chunk_id
        self.chunk_to_id[chunk_id] = internal_id
        self.current_id += 1
        
        return internal_id
    
    def add_batch(self, chunk_ids: List[str], embeddings: List[List[float]]) -> List[int]:
        """Add multiple embeddings"""
        ids = []
        for chunk_id, embedding in zip(chunk_ids, embeddings):
            ids.append(self.add(chunk_id, embedding))
        return ids
    
    def search(self, query_embedding: List[float], top_k: int = TOP_K_RESULTS) -> List[Tuple[str, float]]:
        """Search for nearest neighbors, returns list of (chunk_id, distance)"""
        if self.index.ntotal == 0:
            return []
        
        # Convert to numpy array
        query_vector = np.array([query_embedding], dtype=np.float32)
        
        # Search
        distances, indices = self.index.search(query_vector, min(top_k, self.index.ntotal))
        
        # Map back to chunk IDs
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx != -1 and idx in self.id_to_chunk:
                # Convert L2 distance to similarity score
                similarity = 1 / (1 + dist)
                results.append((self.id_to_chunk[idx], similarity))
        
        return results
    
    def save(self):
        """Persist index and mappings to disk"""
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, self.index_path)
        
        with open(self.id_map_path, 'wb') as f:
            pickle.dump({
                'id_to_chunk': self.id_to_chunk,
                'chunk_to_id': self.chunk_to_id,
                'current_id': self.current_id
            }, f)
    
    def count(self) -> int:
        """Return number of vectors in index"""
        return self.index.ntotal


# Singleton instance
_store = None

def get_faiss_store() -> FAISSStore:
    global _store
    if _store is None:
        _store = FAISSStore()
    return _store
