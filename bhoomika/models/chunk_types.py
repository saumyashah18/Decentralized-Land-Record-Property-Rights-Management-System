"""
Chunk Type Definitions for Multi-Granularity RAG
"""
from enum import Enum


class ChunkType(str, Enum):
    """
    Multi-granularity chunk types for context-aware retrieval
    """
    SMALL = "S"    # Individual paragraphs - for definitions, facts, specific details
    MEDIUM = "M"   # Semantically merged paragraphs - for explanations, procedures
    LARGE = "L"    # Full sections/documents - for broad context, overviews
    
    def __str__(self):
        return self.value
    
    @classmethod
    def from_string(cls, value: str):
        """Convert string to ChunkType"""
        mapping = {
            "S": cls.SMALL,
            "M": cls.MEDIUM,
            "L": cls.LARGE,
            "SMALL": cls.SMALL,
            "MEDIUM": cls.MEDIUM,
            "LARGE": cls.LARGE
        }
        return mapping.get(value.upper(), cls.MEDIUM)
