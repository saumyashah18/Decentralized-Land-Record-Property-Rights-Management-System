
import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
MODEL = "BAAI/bge-large-en-v1.5"
API_URL = f"https://api-inference.huggingface.co/models/{MODEL}"
HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

def test_api():
    print(f"Testing API for {MODEL}...")
    payload = {"inputs": "Test sentence for embedding.", "options": {"wait_for_model": True}}
    
    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {response.json()[:1]}") # print partial to avoid spam
        except:
            print(f"Response Text: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if not HF_API_KEY:
        print("HF_API_KEY not found in .env")
    else:
        test_api()
