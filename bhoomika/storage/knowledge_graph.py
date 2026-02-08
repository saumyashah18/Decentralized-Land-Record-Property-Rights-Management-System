"""
Knowledge Graph for Semantic Relationships Between Chunks
"""
import os
import pickle
import networkx as nx
from typing import List, Set, Tuple
import sys
sys.path.append('..')
from config import GRAPH_PATH, GRAPH_EXPANSION_DEPTH


class KnowledgeGraph:
    """
    NetworkX-based knowledge graph for storing semantic relationships
    """
    
    def __init__(self):
        self.graph_path = GRAPH_PATH
        self._load_or_create_graph()
    
    def _load_or_create_graph(self):
        """Load existing graph or create new one"""
        if os.path.exists(self.graph_path):
            self.graph = nx.read_gpickle(self.graph_path)
        else:
            self.graph = nx.Graph()
    
    def add_node(self, chunk_id: str, **attributes):
        """Add a chunk node with attributes"""
        self.graph.add_node(chunk_id, **attributes)
    
    def add_edge(self, chunk_id_1: str, chunk_id_2: str, weight: float = 1.0, 
                 relationship: str = "related"):
        """Add edge between two chunks"""
        self.graph.add_edge(chunk_id_1, chunk_id_2, weight=weight, relationship=relationship)
    
    def add_sequential_edges(self, chunk_ids: List[str], document_id: str):
        """Add edges between sequential chunks in a document"""
        for i in range(len(chunk_ids) - 1):
            self.add_edge(
                chunk_ids[i], 
                chunk_ids[i + 1], 
                weight=0.8,
                relationship="sequential"
            )
            # Also add node with document reference
            self.graph.nodes[chunk_ids[i]]['document_id'] = document_id
        
        # Add last node's document reference
        if chunk_ids:
            self.graph.nodes[chunk_ids[-1]]['document_id'] = document_id
    
    def add_semantic_edge(self, chunk_id_1: str, chunk_id_2: str, similarity: float):
        """Add semantic similarity edge based on embedding similarity"""
        if similarity > 0.7:  # Threshold for adding semantic edges
            self.add_edge(
                chunk_id_1,
                chunk_id_2,
                weight=similarity,
                relationship="semantic"
            )
    
    def get_neighbors(self, chunk_id: str, depth: int = GRAPH_EXPANSION_DEPTH) -> Set[str]:
        """Get neighboring chunks up to specified depth"""
        if chunk_id not in self.graph:
            return set()
        
        neighbors = set()
        current_level = {chunk_id}
        
        for _ in range(depth):
            next_level = set()
            for node in current_level:
                if node in self.graph:
                    next_level.update(self.graph.neighbors(node))
            neighbors.update(next_level)
            current_level = next_level - neighbors
        
        neighbors.discard(chunk_id)  # Remove the query node itself
        return neighbors
    
    def get_related_chunks(self, chunk_ids: List[str], depth: int = 1) -> Set[str]:
        """Get all related chunks for a list of chunk IDs"""
        related = set()
        for chunk_id in chunk_ids:
            related.update(self.get_neighbors(chunk_id, depth))
        return related - set(chunk_ids)
    
    def get_document_chunks(self, document_id: str) -> List[str]:
        """Get all chunks belonging to a document"""
        chunks = []
        for node in self.graph.nodes():
            if self.graph.nodes[node].get('document_id') == document_id:
                chunks.append(node)
        return chunks
    
    def save(self):
        """Persist graph to disk"""
        os.makedirs(os.path.dirname(self.graph_path), exist_ok=True)
        nx.write_gpickle(self.graph, self.graph_path)
    
    def node_count(self) -> int:
        """Return number of nodes"""
        return self.graph.number_of_nodes()
    
    def edge_count(self) -> int:
        """Return number of edges"""
        return self.graph.number_of_edges()
    
    def add_keyword_relations(self, chunk_ids: list, chunk_texts: list, document_id: str):
        """
        Build deterministic keyword-based relations between chunks.
        Inspired by EduRank's knowledge graph approach.
        
        Extracts capitalized keywords (>4 chars) and creates relations
        between chunks that share concepts.
        """
        import re
        
        if len(chunk_ids) < 2:
            return
        
        # Stopwords to ignore
        ignore_words = {
            'this', 'that', 'there', 'their', 'these', 'those',
            'chapter', 'section', 'about', 'would', 'could', 'should',
            'which', 'where', 'while', 'when', 'what'
        }
        
        # Extract keywords for each chunk
        chunk_keywords = {}
        for chunk_id, text in zip(chunk_ids, chunk_texts):
            # Find capitalized words (potential proper nouns, concepts)
            keywords = set()
            found = re.findall(r'\b[A-Z][a-z]{4,}\b', text)
            for word in found:
                if word.lower() not in ignore_words:
                    keywords.add(word)
            
            # Also extract acronyms (all caps, 2+ letters)
            acronyms = re.findall(r'\b[A-Z]{2,}\b', text)
            keywords.update(acronyms)
            
            chunk_keywords[chunk_id] = keywords
        
        # Create relations based on shared keywords
        for i, chunk_id_1 in enumerate(chunk_ids):
            for chunk_id_2 in chunk_ids[i+1:]:
                shared = chunk_keywords[chunk_id_1] & chunk_keywords[chunk_id_2]
                
                if shared:
                    # Use first shared keyword as relation type
                    keyword = list(shared)[0]
                    self.add_edge(
                        chunk_id_1,
                        chunk_id_2,
                        weight=0.9,
                        relationship=f"shared_concept:{keyword}"
                    )


# Singleton instance
_graph = None

def get_knowledge_graph() -> KnowledgeGraph:
    global _graph
    if _graph is None:
        _graph = KnowledgeGraph()
    return _graph
