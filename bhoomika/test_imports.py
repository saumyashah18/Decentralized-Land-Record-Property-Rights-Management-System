
try:
    import faiss
    print("FAISS imported successfully")
except ImportError as e:
    print(f"FAISS import failed: {e}")

try:
    import networkx
    print("NetworkX imported successfully")
except ImportError as e:
    print(f"NetworkX import failed: {e}")

try:
    import sqlalchemy
    print("SQLAlchemy imported successfully")
except ImportError as e:
    print(f"SQLAlchemy import failed: {e}")

try:
    import google.generativeai
    print("Google GenAI imported successfully")
except ImportError as e:
    print(f"Google GenAI import failed: {e}")
