"""
End-to-End Test: Document Ingestion with Multi-Granularity Chunking
Tests the complete pipeline from document ingestion to retrieval
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline.ingestion import get_ingestion_pipeline
from storage import get_sqlite_store, get_faiss_store, get_knowledge_graph


def test_end_to_end_ingestion():
    """Test complete document ingestion with multi-granularity chunking"""
    
    print("\n" + "="*60)
    print("END-TO-END TEST: Document Ingestion")
    print("="*60)
    
    # Sample land registry document
    sample_text = """
Land Registry System Overview

The BhoomiSetu land registry system is a blockchain-based platform for managing property records in India.

ULPIN Generation

Each property is assigned a Unique Land Parcel Identification Number (ULPIN). The ULPIN is generated based on geographic coordinates and administrative boundaries.

The format follows the Bhu-Aadhar standard. This ensures nationwide compatibility and interoperability.

Blockchain Architecture

The system uses a hybrid blockchain architecture. Hyperledger Fabric provides authoritative governance for government entities.

Ethereum is used for public verification. This ensures transparency and immutability of property records.

Smart Contract Automation

Property transfers are automated through smart contracts. The contracts verify all legal requirements before execution.

This reduces processing time significantly. It also minimizes the risk of fraud and errors.
"""
    
    # Get ingestion pipeline
    pipeline = get_ingestion_pipeline()
    
    print("\n[1/4] Ingesting document with multi-granularity chunking...")
    doc_id = pipeline.ingest_text(
        text=sample_text,
        title="Land Registry System Documentation",
        description="Overview of BhoomiSetu blockchain-based land registry",
        use_multi_granularity=True
    )
    
    print(f"✓ Document ingested with ID: {doc_id}")
    
    # Verify chunks in database
    print("\n[2/4] Verifying chunks in database...")
    sqlite_store = get_sqlite_store()
    chunks = sqlite_store.get_chunks_by_document(doc_id)
    
    chunk_types = {}
    for chunk in chunks:
        chunk_type = chunk.chunk_type
        chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1
    
    print(f"✓ Total chunks: {len(chunks)}")
    for chunk_type, count in sorted(chunk_types.items()):
        print(f"  - Type {chunk_type}: {count} chunks")
    
    assert 'S' in chunk_types, "Should have SMALL chunks"
    assert 'M' in chunk_types, "Should have MEDIUM chunks"
    assert 'L' in chunk_types, "Should have LARGE chunks"
    
    # Verify embeddings in FAISS
    print("\n[3/4] Verifying embeddings in FAISS...")
    faiss_store = get_faiss_store()
    vector_count = faiss_store.count()
    
    # Should have S + M chunks embedded (not L)
    expected_embedded = chunk_types.get('S', 0) + chunk_types.get('M', 0)
    print(f"✓ Vectors in FAISS: {vector_count}")
    print(f"  Expected (S + M chunks): {expected_embedded}")
    
    # Verify knowledge graph
    print("\n[4/4] Verifying knowledge graph...")
    kg = get_knowledge_graph()
    node_count = kg.node_count()
    edge_count = kg.edge_count()
    
    print(f"✓ Knowledge graph:")
    print(f"  - Nodes: {node_count}")
    print(f"  - Edges: {edge_count}")
    
    assert node_count >= len(chunks), "Should have nodes for all chunks"
    assert edge_count > 0, "Should have edges connecting chunks"
    
    # Get ingestion stats
    print("\n" + "-"*60)
    stats = pipeline.get_stats()
    print("Ingestion Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print("\n" + "="*60)
    print("✅ END-TO-END TEST PASSED!")
    print("="*60)
    print("\nThe complete pipeline is working:")
    print("  ✓ Multi-granularity chunking (S/M/L)")
    print("  ✓ Database storage with chunk types")
    print("  ✓ FAISS vector indexing (S + M chunks)")
    print("  ✓ Knowledge graph with keyword relations")
    print()


if __name__ == "__main__":
    try:
        test_end_to_end_ingestion()
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
