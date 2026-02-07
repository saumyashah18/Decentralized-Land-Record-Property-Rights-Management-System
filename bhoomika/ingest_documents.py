
"""
Bhoomika Document Ingestion Script

Usage:
1. Place PDF, TXT, or MD files in 'data/documents' directory.
2. Run this script: python ingest_documents.py
3. Processed files will be moved to 'data/processed'.
"""
import os
import shutil
import sys
from typing import List

# Ensure we can import from parent directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from config import DOCUMENTS_DIR, DATA_DIR
    from pipeline.ingestion import get_ingestion_pipeline
    from pipeline.chunking import chunk_document
except ImportError as e:
    print(f"Import Error: {e}")
    # Fallback for direct execution if config not found
    DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
    DOCUMENTS_DIR = os.path.join(DATA_DIR, "documents")

PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(DOCUMENTS_DIR, exist_ok=True)

def ingest_documents():
    print(f"Checking for documents in: {DOCUMENTS_DIR}")
    
    files = [f for f in os.listdir(DOCUMENTS_DIR) if f.lower().endswith(('.pdf', '.txt', '.md'))]
    
    if not files:
        print("No documents found. Please place files in the directory.")
        return

    print(f"Found {len(files)} documents: {files}")
    
    try:
        pipeline = get_ingestion_pipeline()
    except Exception as e:
        print(f"Failed to initialize pipeline: {e}")
        return

    for filename in files:
        file_path = os.path.join(DOCUMENTS_DIR, filename)
        try:
            print(f"Processing: {filename}...")
            
            # Simple text ingestion for now (PDF parsing needs pypdf)
            if filename.lower().endswith('.pdf'):
                try:
                    import pypdf
                    reader = pypdf.PdfReader(file_path)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                except ImportError:
                    print("Error: pypdf not installed. Run 'pip install pypdf'")
                    continue
                except Exception as e:
                    print(f"Error reading PDF {filename}: {e}")
                    continue
            else:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()

            if not text.strip():
                print(f"Skipping empty file: {filename}")
                continue

            # Ingest
            doc_id = pipeline.ingest_text(
                text=text,
                title=filename,
                description=f"Imported from {filename}"
            )
            print(f"Successfully ingested {filename} as ID: {doc_id}")
            
            # Move to processed
            shutil.move(file_path, os.path.join(PROCESSED_DIR, filename))
            print(f"Moved {filename} to processed directory.")
            
        except Exception as e:
            print(f"Failed to process {filename}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    ingest_documents()
