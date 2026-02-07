"""
BGE-M3 Embedding Model via HuggingFace Inference API
"""
import requests
import numpy as np
from typing import List, Union
import sys
sys.path.append('..')
from config import HF_API_KEY, EMBEDDING_MODEL


class BGEEmbeddings:
    """
    Wrapper for BAAI/bge-m3 embeddings via HuggingFace Inference API
    """
    
    def __init__(self):
        self.api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{EMBEDDING_MODEL}"
        self.headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    
    def embed_text(self, text: str) -> List[float]:
        """Embed a single text string"""
        response = requests.post(
            self.api_url,
            headers=self.headers,
            json={"inputs": text, "options": {"wait_for_model": True}}
        )
        
        if response.status_code != 200:
            raise Exception(f"Embedding API error: {response.text}")
        
        embedding = response.json()
        
        # Handle nested response format
        if isinstance(embedding, list) and len(embedding) > 0:
            if isinstance(embedding[0], list):
                # Mean pooling for token embeddings
                embedding = np.mean(embedding, axis=0).tolist()
        
        return embedding
    
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple texts"""
        response = requests.post(
            self.api_url,
            headers=self.headers,
            json={"inputs": texts, "options": {"wait_for_model": True}}
        )
        
        if response.status_code != 200:
            raise Exception(f"Embedding API error: {response.text}")
        
        embeddings = response.json()
        
        # Handle nested response format
        result = []
        for emb in embeddings:
            if isinstance(emb, list) and len(emb) > 0:
                if isinstance(emb[0], list):
                    emb = np.mean(emb, axis=0).tolist()
            result.append(emb)
        
        return result
    
    def embed_query(self, query: str) -> List[float]:
        """Embed a query (alias for embed_text with query prefix)"""
        # BGE-M3 works better with query instruction
        return self.embed_text(f"Represent this query for retrieving documents: {query}")


# Singleton instance
_embeddings = None

def get_embeddings() -> BGEEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = BGEEmbeddings()
    return _embeddings
