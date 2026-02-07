"""
Text Chunking Pipeline
"""
from typing import List, Tuple
import sys
sys.path.append('..')
from config import CHUNK_SIZE, CHUNK_OVERLAP


class TextChunker:
    """
    Text chunking with configurable size and overlap
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
    """Convenience function to chunk a document"""
    chunker = TextChunker(chunk_size, chunk_overlap)
    return chunker.chunk_text(text)
