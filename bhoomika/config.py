"""
Bhoomika AI Assistant - Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
HF_API_KEY = os.getenv("HF_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Model Configuration
EMBEDDING_MODEL = "BAAI/bge-m3"
EMBEDDING_DIMENSION = 1024  # BGE-M3 dimension
GEMINI_MODEL = "gemini-2.0-flash"

# Storage Paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DOCUMENTS_DIR = os.path.join(DATA_DIR, "documents")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index")
SQLITE_DB_PATH = os.path.join(DATA_DIR, "bhoomika.db")
GRAPH_PATH = os.path.join(DATA_DIR, "knowledge_graph.gpickle")

# Retrieval Settings
CHUNK_SIZE = 512
CHUNK_OVERLAP = 50
TOP_K_RESULTS = 5
GRAPH_EXPANSION_DEPTH = 2

# Server Configuration
HOST = "0.0.0.0"
PORT = 8001
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# Ensure directories exist
os.makedirs(DOCUMENTS_DIR, exist_ok=True)
os.makedirs(FAISS_INDEX_PATH, exist_ok=True)
