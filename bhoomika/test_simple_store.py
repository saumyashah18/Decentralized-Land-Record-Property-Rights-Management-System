
import sys
import os

try:
    print("Importing simple_store...")
    from storage.simple_store import SimpleVectorStore
    print("SimpleVectorStore imported.")
    
    print("Initializing SimpleVectorStore...")
    store = SimpleVectorStore()
    print("SimpleVectorStore initialized.")
    
    print("Adding vector...")
    store.add("test_id", [0.1] * 384)
    print("Vector added.")
    
    print("Searching...")
    results = store.search([0.1] * 384)
    print(f"Search results: {results}")
    
    print("SimpleVectorStore test PASSED.")

except Exception as e:
    print(f"SimpleVectorStore test FAILED: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
