
# Bhoomika AI Assistant - Initialization Script
import os
import sys
from models import get_embeddings
from storage import get_sqlite_store, get_faiss_store, get_knowledge_graph

def init_db():
    print("Initializing Bhoomika AI Assistant Database...")
    
    # Initialize SQLite
    sqlite_store = get_sqlite_store()
    print(f"SQLite DB check: {sqlite_store.count_documents()} documents, {sqlite_store.count_chunks()} chunks")
    
    # Initialize FAISS
    faiss_store = get_faiss_store()
    print(f"FAISS Index check: {faiss_store.count()} vectors")
    
    # Initialize Knowledge Graph
    kg = get_knowledge_graph()
    print(f"Knowledge Graph check: {kg.node_count()} nodes, {kg.edge_count()} edges")
    
    print("\nInitialization Complete! You can now run the server with: python main.py")

if __name__ == "__main__":
    init_db()
