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


# Singleton instance
_graph = None

def get_knowledge_graph() -> KnowledgeGraph:
    global _graph
    if _graph is None:
        _graph = KnowledgeGraph()
    return _graph
