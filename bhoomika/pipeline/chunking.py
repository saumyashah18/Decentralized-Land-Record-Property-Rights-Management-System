"""
Enhanced Text Chunking Pipeline with Multi-Granularity Support
Inspired by EduRank's pedagogical chunking strategy
"""
from typing import List, Tuple, Dict
import sys
import re
sys.path.append('..')
from config import CHUNK_SIZE, CHUNK_OVERLAP
from models.chunk_types import ChunkType


class EnhancedChunker:
    """
    Multi-granularity text chunker with semantic paragraph merging
    Generates Small, Medium, and Large chunks for context-aware retrieval
    """
    
    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def generate_multi_granularity_chunks(self, text: str) -> Dict[ChunkType, List[Tuple[str, int, int]]]:
        """
        Generate chunks at three granularity levels:
        - SMALL: Individual paragraphs (facts, definitions)
        - MEDIUM: Semantically merged paragraphs (explanations)
        - LARGE: Full document (broad context)
        
        Returns dict mapping ChunkType to list of (chunk_text, start_char, end_char)
        """
        if not text or len(text.strip()) == 0:
            return {
                ChunkType.SMALL: [],
                ChunkType.MEDIUM: [],
                ChunkType.LARGE: []
            }
        
        text = text.strip()
        
        # Step 1: Split into paragraphs (SMALL chunks)
        paragraphs = self._split_into_paragraphs(text)
        small_chunks = self._create_chunk_tuples(paragraphs, text)
        
        # Step 2: Semantic merging (MEDIUM chunks)
        merged_paragraphs = self._semantic_merge(paragraphs)
        medium_chunks = self._create_chunk_tuples(merged_paragraphs, text)
        
        # Step 3: Full document (LARGE chunk)
        large_chunks = [(text, 0, len(text))]
        
        return {
            ChunkType.SMALL: small_chunks,
            ChunkType.MEDIUM: medium_chunks,
            ChunkType.LARGE: large_chunks
        }
    
    def _split_into_paragraphs(self, text: str) -> List[str]:
        """
        Split text into paragraphs based on double newlines.
        This creates natural semantic boundaries.
        """
        # Split on double newlines (paragraph boundaries)
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        # If no double newlines, fall back to single newlines
        if len(paragraphs) <= 1:
            paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
        
        # If still no splits, treat as single paragraph
        if len(paragraphs) == 0:
            paragraphs = [text]
        
        return paragraphs
    
    def _semantic_merge(self, paragraphs: List[str]) -> List[str]:
        """
        Merge semantically related paragraphs using heuristic logic.
        
        Merging rules:
        1. Merge if current paragraph is very short (< 100 chars)
        2. Merge if next paragraph starts with lowercase (continuation)
        3. Merge if next paragraph starts with conjunction/transition words
        
        Future enhancement: Use LLM for semantic understanding
        """
        if len(paragraphs) <= 1:
            return paragraphs
        
        merged = []
        i = 0
        
        while i < len(paragraphs):
            current = paragraphs[i]
            
            # Try to merge with next paragraph
            if i + 1 < len(paragraphs):
                next_p = paragraphs[i + 1]
                
                if self._should_merge(current, next_p):
                    # Merge paragraphs with double space
                    merged.append(current + "  " + next_p)
                    i += 2
                    continue
            
            # No merge, add current paragraph
            merged.append(current)
            i += 1
        
        return merged
    
    def _should_merge(self, p1: str, p2: str) -> bool:
        """
        Determine if two paragraphs should be merged.
        
        Heuristics:
        - p1 is short (< 100 chars) - likely incomplete thought
        - p2 starts with lowercase - continuation of previous sentence
        - p2 starts with transition words - related content
        """
        # Short paragraph heuristic
        if len(p1) < 100:
            return True
        
        # Lowercase continuation heuristic
        if p2 and p2[0].islower():
            return True
        
        # Transition word heuristic
        transition_words = [
            'however', 'therefore', 'moreover', 'furthermore',
            'additionally', 'consequently', 'thus', 'hence',
            'similarly', 'likewise', 'meanwhile', 'nevertheless'
        ]
        
        first_word = p2.split()[0].lower().rstrip('.,;:') if p2.split() else ''
        if first_word in transition_words:
            return True
        
        return False
    
    def _create_chunk_tuples(self, paragraphs: List[str], original_text: str) -> List[Tuple[str, int, int]]:
        """
        Create chunk tuples with (text, start_char, end_char) positions.
        Positions are approximate based on finding text in original.
        """
        chunks = []
        search_start = 0
        
        for para in paragraphs:
            # Find paragraph position in original text
            # Use first 50 chars for matching to handle minor whitespace differences
            search_text = para[:50] if len(para) > 50 else para
            
            try:
                start_pos = original_text.index(search_text, search_start)
                end_pos = start_pos + len(para)
                chunks.append((para, start_pos, end_pos))
                search_start = end_pos
            except ValueError:
                # If exact match fails, use approximate position
                chunks.append((para, search_start, search_start + len(para)))
                search_start += len(para)
        
        return chunks


class TextChunker:
    """
    Legacy text chunker with configurable size and overlap.
    Kept for backward compatibility.
    """
    
    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_text(self, text: str) -> List[Tuple[str, int, int]]:
        """
        Split text into overlapping chunks.
        Returns list of (chunk_text, start_char, end_char)
        """
        if not text or len(text.strip()) == 0:
            return []
        
        # Clean text
        text = text.strip()
        
        # Split into sentences for cleaner chunks
        sentences = self._split_sentences(text)
        
        chunks = []
        current_chunk = []
        current_length = 0
        chunk_start = 0
        
        for sentence in sentences:
            sentence_length = len(sentence)
            
            if current_length + sentence_length <= self.chunk_size:
                current_chunk.append(sentence)
                current_length += sentence_length + 1  # +1 for space
            else:
                if current_chunk:
                    chunk_text = ' '.join(current_chunk)
                    chunk_end = chunk_start + len(chunk_text)
                    chunks.append((chunk_text, chunk_start, chunk_end))
                    
                    # Handle overlap
                    overlap_sentences = []
                    overlap_length = 0
                    for s in reversed(current_chunk):
                        if overlap_length + len(s) <= self.chunk_overlap:
                            overlap_sentences.insert(0, s)
                            overlap_length += len(s) + 1
                        else:
                            break
                    
                    chunk_start = chunk_end - overlap_length
                    current_chunk = overlap_sentences + [sentence]
                    current_length = overlap_length + sentence_length
                else:
                    # Sentence is longer than chunk_size, split it
                    for i in range(0, sentence_length, self.chunk_size - self.chunk_overlap):
                        sub_chunk = sentence[i:i + self.chunk_size]
                        chunks.append((sub_chunk, chunk_start + i, chunk_start + i + len(sub_chunk)))
                    chunk_start += sentence_length
                    current_chunk = []
                    current_length = 0
        
        # Add remaining chunk
        if current_chunk:
            chunk_text = ' '.join(current_chunk)
            chunk_end = chunk_start + len(chunk_text)
            chunks.append((chunk_text, chunk_start, chunk_end))
        
        return chunks
    
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        import re
        # Split on sentence-ending punctuation followed by space or newline
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]


def chunk_document(text: str, chunk_size: int = CHUNK_SIZE, 
                   chunk_overlap: int = CHUNK_OVERLAP) -> List[Tuple[str, int, int]]:
    """Convenience function to chunk a document (legacy compatibility)"""
    chunker = TextChunker(chunk_size, chunk_overlap)
    return chunker.chunk_text(text)


def chunk_document_multi_granularity(text: str) -> Dict[ChunkType, List[Tuple[str, int, int]]]:
    """Convenience function for multi-granularity chunking"""
    chunker = EnhancedChunker()
    return chunker.generate_multi_granularity_chunks(text)
