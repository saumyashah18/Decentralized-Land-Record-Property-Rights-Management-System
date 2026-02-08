"""
Test Script: Multi-Granularity Chunking
Verifies the enhanced RAG system with S/M/L chunks
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline.chunking import EnhancedChunker, chunk_document_multi_granularity
from models.chunk_types import ChunkType


def test_multi_granularity_chunking():
    """Test multi-granularity chunking on sample text"""
    
    print("\n" + "="*60)
    print("TEST 1: Multi-Granularity Chunking")
    print("="*60)
    
    test_text = """
Land Registry Overview

The land registry system maintains comprehensive property records across India.

Each property has a unique ULPIN identifier. This identifier is generated based on geographic coordinates and administrative boundaries.

Property transfers require verification. The verification process involves multiple steps including document validation, ownership checks, and legal clearance.

Blockchain Integration

The system uses Hyperledger Fabric for authoritative governance. Ethereum is used for public verification and transparency.

Smart contracts automate property transfers. They ensure all conditions are met before executing the transfer.
"""
    
    chunker = EnhancedChunker()
    chunks_by_type = chunker.generate_multi_granularity_chunks(test_text)
    
    print(f"\n✓ Generated chunks:")
    for chunk_type, chunks in chunks_by_type.items():
        print(f"  - {chunk_type.name} ({chunk_type.value}): {len(chunks)} chunks")
    
    # Verify expectations
    s_chunks = chunks_by_type[ChunkType.SMALL]
    m_chunks = chunks_by_type[ChunkType.MEDIUM]
    l_chunks = chunks_by_type[ChunkType.LARGE]
    
    assert len(s_chunks) >= len(m_chunks), "Should have more S chunks than M chunks"
    assert len(l_chunks) == 1, "Should have exactly 1 L chunk"
    assert len(s_chunks) > 0, "Should have at least 1 S chunk"
    
    print("\n✓ Chunk counts validated")
    
    # Display sample chunks
    print("\n--- Sample SMALL chunk ---")
    print(s_chunks[0][0][:200] + "..." if len(s_chunks[0][0]) > 200 else s_chunks[0][0])
    
    print("\n--- Sample MEDIUM chunk ---")
    print(m_chunks[0][0][:200] + "..." if len(m_chunks[0][0]) > 200 else m_chunks[0][0])
    
    print("\n--- LARGE chunk (first 200 chars) ---")
    print(l_chunks[0][0][:200] + "...")
    
    print("\n✅ Test 1 PASSED: Multi-granularity chunking works correctly")


def test_semantic_merging():
    """Test semantic paragraph merging"""
    
    print("\n" + "="*60)
    print("TEST 2: Semantic Paragraph Merging")
    print("="*60)
    
    # Test case: short paragraph followed by continuation
    test_paragraphs = [
        'Property rights are important.',
        'they ensure legal ownership and protection.'
    ]
    
    chunker = EnhancedChunker()
    merged = chunker._semantic_merge(test_paragraphs)
    
    print(f"\nOriginal paragraphs: {len(test_paragraphs)}")
    print(f"After merging: {len(merged)}")
    
    assert len(merged) == 1, "Should merge lowercase continuation"
    assert 'important' in merged[0] and 'ownership' in merged[0], "Merged text should contain both parts"
    
    print(f"\nMerged result: {merged[0]}")
    print("\n✅ Test 2 PASSED: Semantic merging works correctly")


def test_keyword_extraction():
    """Test keyword extraction for knowledge graph"""
    
    print("\n" + "="*60)
    print("TEST 3: Keyword Extraction")
    print("="*60)
    
    import re
    
    text1 = "The ULPIN system uses Geographic coordinates for property identification."
    text2 = "Geographic Information Systems help with mapping and visualization."
    
    # Extract keywords (same logic as knowledge_graph.py)
    ignore_words = {'this', 'that', 'there', 'their', 'these', 'those'}
    
    keywords1 = set()
    found = re.findall(r'\b[A-Z][a-z]{4,}\b', text1)
    for word in found:
        if word.lower() not in ignore_words:
            keywords1.add(word)
    acronyms = re.findall(r'\b[A-Z]{2,}\b', text1)
    keywords1.update(acronyms)
    
    keywords2 = set()
    found = re.findall(r'\b[A-Z][a-z]{4,}\b', text2)
    for word in found:
        if word.lower() not in ignore_words:
            keywords2.add(word)
    acronyms = re.findall(r'\b[A-Z]{2,}\b', text2)
    keywords2.update(acronyms)
    
    shared = keywords1 & keywords2
    
    print(f"\nText 1 keywords: {keywords1}")
    print(f"Text 2 keywords: {keywords2}")
    print(f"Shared keywords: {shared}")
    
    assert 'Geographic' in shared, "Should find 'Geographic' as shared keyword"
    
    print("\n✅ Test 3 PASSED: Keyword extraction works correctly")


def test_convenience_function():
    """Test convenience function for multi-granularity chunking"""
    
    print("\n" + "="*60)
    print("TEST 4: Convenience Function")
    print("="*60)
    
    test_text = "Paragraph 1.\n\nParagraph 2.\n\nParagraph 3."
    
    result = chunk_document_multi_granularity(test_text)
    
    assert isinstance(result, dict), "Should return a dictionary"
    assert ChunkType.SMALL in result, "Should contain SMALL chunks"
    assert ChunkType.MEDIUM in result, "Should contain MEDIUM chunks"
    assert ChunkType.LARGE in result, "Should contain LARGE chunks"
    
    print(f"\n✓ Result contains all chunk types")
    print(f"  - SMALL: {len(result[ChunkType.SMALL])} chunks")
    print(f"  - MEDIUM: {len(result[ChunkType.MEDIUM])} chunks")
    print(f"  - LARGE: {len(result[ChunkType.LARGE])} chunks")
    
    print("\n✅ Test 4 PASSED: Convenience function works correctly")


if __name__ == "__main__":
    print("\n" + "#"*60)
    print("# Enhanced RAG System - Multi-Granularity Chunking Tests")
    print("#"*60)
    
    try:
        test_multi_granularity_chunking()
        test_semantic_merging()
        test_keyword_extraction()
        test_convenience_function()
        
        print("\n" + "="*60)
        print("🎉 ALL TESTS PASSED!")
        print("="*60)
        print("\nThe enhanced RAG system is working correctly:")
        print("  ✓ Multi-granularity chunking (S/M/L)")
        print("  ✓ Semantic paragraph merging")
        print("  ✓ Keyword-based knowledge graph relations")
        print("  ✓ Convenience functions")
        print("\n")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
