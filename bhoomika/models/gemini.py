"""
Gemini 2.5 Flash Client for Response Generation
"""
import google.generativeai as genai
from typing import Generator, Optional
import sys
sys.path.append('..')
from config import GEMINI_API_KEY, GEMINI_MODEL


# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)


SYSTEM_PROMPT = """You are Bhoomika, an AI assistant specializing in Indian land and property rights. 
You help citizens understand:
- Land registration processes
- Property transfer procedures
- Legal compliance requirements
- Rights and documentation
- BhoomiSetu platform features

Guidelines:
1. Be helpful, accurate, and concise
2. Cite specific laws/sections when relevant (e.g., Transfer of Property Act, Registration Act)
3. If unsure, acknowledge uncertainty and suggest consulting a legal professional
4. Use the provided context to answer questions
5. Respond in a friendly, accessible manner
6. Use Hindi terms with English translations when helpful

Context from knowledge base:
{context}

User question: {query}

Provide a helpful response:"""


class GeminiClient:
    """
    Gemini 2.5 Flash client for generating responses
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
        )
    
    def generate(self, query: str, context: str) -> str:
        """Generate a response given query and context"""
        prompt = SYSTEM_PROMPT.format(context=context, query=query)
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_stream(self, query: str, context: str) -> Generator[str, None, None]:
        """Generate a streaming response"""
        prompt = SYSTEM_PROMPT.format(context=context, query=query)
        
        response = self.model.generate_content(prompt, stream=True)
        
        for chunk in response:
            if chunk.text:
                yield chunk.text


# Singleton instance
_client = None

def get_gemini_client() -> GeminiClient:
    global _client
    if _client is None:
        _client = GeminiClient()
    return _client
