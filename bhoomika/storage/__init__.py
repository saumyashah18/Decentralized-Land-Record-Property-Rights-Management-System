# Force SimpleVectorStore for stability on Windows
# try:
#     from .faiss_store import get_faiss_store, FAISSStore
# except ImportError:
#     from .simple_store import get_faiss_store, SimpleVectorStore as FAISSStore
from .simple_store import get_faiss_store, SimpleVectorStore as FAISSStore

from .sqlite_store import get_sqlite_store, SQLiteStore
from .knowledge_graph import get_knowledge_graph, KnowledgeGraph
