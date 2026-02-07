"""
Hybrid Retrieval Pipeline (Vector + Graph)
"""
from typing import List, Tuple, Dict
import sys
sys.path.append('..')
from config import TOP_K_RESULTS, GRAPH_EXPANSION_DEPTH
from models import get_embeddings
from storage import get_faiss_store, get_sqlite_store, get_knowledge_graph


class HybridRetrieval:
    """
    Hybrid retrieval combining vector similarity and graph traversal
    """
    
    def __init__(self):
        self.embeddings = get_embeddings()
        self.faiss_store = get_faiss_store()
        self.sqlite_store = get_sqlite_store()
        self.knowledge_graph = get_knowledge_graph()
    
    def retrieve(self, query: str, top_k: int = TOP_K_RESULTS) -> List[Dict]:
        """
        Retrieve relevant chunks using hybrid approach.
        Returns list of {chunk_id, content, score, source}
        """
        # Step 1: Vector search
        query_embedding = self.embeddings.embed_query(query)
        vector_results = self.faiss_store.search(query_embedding, top_k * 2)
        
        # Step 2: Graph expansion
        vector_chunk_ids = [chunk_id for chunk_id, _ in vector_results]
        graph_neighbors = self.knowledge_graph.get_related_chunks(
            vector_chunk_ids, 
            depth=GRAPH_EXPANSION_DEPTH
        )
        
        # Step 3: Score fusion
        scores = {}
        
        # Assign vector scores
        for chunk_id, similarity in vector_results:
            scores[chunk_id] = {
                'vector_score': similarity,
                'graph_score': 0.0,
                'source': 'vector'
            }
        
        # Assign graph scores (proximity-based)
        for neighbor_id in graph_neighbors:
            if neighbor_id not in scores:
                scores[neighbor_id] = {
                    'vector_score': 0.0,
                    'graph_score': 0.3,  # Base graph score
                    'source': 'graph'
                }
            else:
                scores[neighbor_id]['graph_score'] = 0.2  # Boost for graph neighbors
                scores[neighbor_id]['source'] = 'hybrid'
        
        # Calculate final scores (weighted fusion)
        for chunk_id in scores:
            s = scores[chunk_id]
            s['final_score'] = 0.7 * s['vector_score'] + 0.3 * s['graph_score']
        
        # Step 4: Rank and get top-k
        ranked = sorted(scores.items(), key=lambda x: x[1]['final_score'], reverse=True)[:top_k]
        
        # Step 5: Fetch chunk contents
        chunk_ids = [chunk_id for chunk_id, _ in ranked]
        contents = self.sqlite_store.get_multiple_chunk_contents(chunk_ids)
        
        # Build results
        results = []
        for chunk_id, score_data in ranked:
            content = contents.get(chunk_id, "")
            if content:
                results.append({
                    'chunk_id': chunk_id,
                    'content': content,
                    'score': score_data['final_score'],
                    'source': score_data['source']
                })
        
        return results
    
    def build_context(self, results: List[Dict], max_tokens: int = 2000) -> str:
        """
        Build context string from retrieval results
        """
        context_parts = []
        current_length = 0
        
        for result in results:
            content = result['content']
            # Rough token estimate (4 chars per token)
            content_tokens = len(content) // 4
            
            if current_length + content_tokens > max_tokens:
                break
            
            context_parts.append(f"[Source: {result['chunk_id']}]\n{content}")
            current_length += content_tokens
        
        return "\n\n---\n\n".join(context_parts)


def get_retrieval_pipeline() -> HybridRetrieval:
    return HybridRetrieval()
