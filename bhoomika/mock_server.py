
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat(request: dict):
    print(f"Received chat request: {request}")
    return {"response": "This is a mock response from Bhoomika (Backend is verifying environment).", "sources": []}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "bhoomika-mock"}

if __name__ == "__main__":
    print("Starting mock server on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
