
import sys
import os

print("Starting debug imports...")

try:
    print("Importing config...")
    from config import DATA_DIR
    print(f"Config imported. DATA_DIR: {DATA_DIR}")
except Exception as e:
    print(f"Config import failed: {e}")

try:
    print("Importing models.embeddings...")
    from models.embeddings import get_embeddings
    print("models.embeddings imported.")
except Exception as e:
    print(f"models.embeddings import failed: {e}")

try:
    print("Importing models.gemini...")
    from models.gemini import get_gemini_client
    print("models.gemini imported.")
except Exception as e:
    print(f"models.gemini import failed: {e}")

try:
    print("Importing storage.sqlite_store...")
    from storage.sqlite_store import get_sqlite_store
    print("storage.sqlite_store imported.")
except Exception as e:
    print(f"storage.sqlite_store import failed: {e}")

try:
    print("Importing storage.faiss_store...")
    from storage.faiss_store import get_faiss_store
    print("storage.faiss_store imported.")
    try:
        store = get_faiss_store()
        print("FAISS store initialized.")
    except Exception as e:
        print(f"FAISS store initialization failed: {e}")
except Exception as e:
    print(f"storage.faiss_store import failed: {e}")

try:
    print("Importing storage.knowledge_graph...")
    from storage.knowledge_graph import get_knowledge_graph
    print("storage.knowledge_graph imported.")
except Exception as e:
    print(f"storage.knowledge_graph import failed: {e}")

try:
    print("Importing pipeline.ingestion...")
    from pipeline.ingestion import get_ingestion_pipeline
    print("pipeline.ingestion imported.")
except Exception as e:
    print(f"pipeline.ingestion import failed: {e}")

print("Debug imports finished.")
