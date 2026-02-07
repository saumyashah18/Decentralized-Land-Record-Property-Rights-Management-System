
"""
Direct Seed Data Script (Bypassing Pipeline Module)
"""
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import DOCUMENTS_DIR
from models.embeddings import get_embeddings
from storage.simple_store import get_faiss_store
from storage.sqlite_store import get_sqlite_store
from storage.knowledge_graph import get_knowledge_graph
from pipeline.chunking import chunk_document

# Sample content for Indian Land Laws
LAND_LAWS_CONTENT = """
# Transfer of Property Act, 1882

## Section 54: Sale Defined
"Sale" is a transfer of ownership in exchange for a price paid or promised or part-paid and part-promised.
Such transfer, in the case of tangible immoveable property of the value of one hundred rupees and upwards, or in the case of a reversion or other intangible thing, can be made only by a registered instrument.

## Section 58: Mortgage
A mortgage is the transfer of an interest in specific immoveable property for the purpose of securing the payment of money advanced or to be advanced by way of loan, an existing or future debt, or the performance of an engagement which may give rise to a pecuniary liability.

# Registration Act, 1908

## Section 17: Documents of which registration is compulsory
(1) The following documents shall be registered:
(b) non-testamentary instruments which purport or operate to create, declare, assign, limit or extinguish, whether in present or in future, any right, title or interest, whether vested or contingent, of the value of one hundred rupees and upwards, to or in immoveable property.

# Indian Stamp Act, 1899

Stamp duty is a tax that is levied on documents. Historically, this included the majority of legal documents such as cheques, receipts, military commissions, marriage licences and land transactions. A physical stamp (a tax stamp) had to be attached to or impressed upon the document to denote that stamp duty had been paid before the document was legally effective.

# BhoomiSetu Platform Guide

## How to Register Property
1. Login to the citizen dashboard.
2. Navigate to "My Properties".
3. Click on "Register New Property".
4. Upload required documents (Sale Deed, Identity Proof, etc.).
5. Pay the registration fee using crypto wallet.
6. Await registrar approval.

## Documents Required
- Sale Deed / Title Deed
- PAN Card & Aadhaar Card of Buyer and Seller
- Encumbrance Certificate
- Building Plan Approval
- Property Tax Receipts
"""

def seed_data_direct():
    print("Starting direct seeding...")
    
    try:
        # Initialize components
        print("Initializing stores...")
        sqlite_store = get_sqlite_store()
        faiss_store = get_faiss_store()
        knowledge_graph = get_knowledge_graph()
        embeddings_model = get_embeddings()
        
        # 1. Add Document Metadata
        print("Adding document metadata...")
        doc_id = sqlite_store.add_document(
            title="Indian Land Laws & BhoomiSetu Guide",
            description="Core legal provisions and platform usage guide",
            file_type="text",
            file_path="memory://land_laws.txt"
        )
        print(f"Document ID: {doc_id}")
        
        # 2. Chunking
        print("Chunking text...")
        chunks = chunk_document(LAND_LAWS_CONTENT, chunk_size=512, chunk_overlap=50)
        # chunk_document returns list of (text, start, end) tuples
        chunk_texts = [chunk[0] for chunk in chunks]
        print(f"Created {len(chunks)} chunks.")
        
        # 3. Embedding
        print("Generating embeddings (SKIPPED)...")
        # embeddings = embeddings_model.embed_batch(chunk_texts)
        # print(f"Generated {len(embeddings)} embeddings.")
        
        # 4. Storage & Graph Construction
        print("Storing chunks and building graph...")
        chunk_ids = []
        for i, chunk in enumerate(chunks):
            chunk_text = chunk[0]
            # embedding = embeddings[i]
            
            # Store metadata
            chunk_id = sqlite_store.add_chunk(doc_id, chunk_text, i)
            chunk_ids.append(chunk_id)
            
            # Store vector (SimpleStore handles ID mapping internally if needed, but here we pass chunk_id)
            # FaissStore.add(chunk_id, vector)
            # faiss_store.add(chunk_id, embedding)
        
        # Build sequential graph edges
        print("Building graph edges...")
        knowledge_graph.add_sequential_edges(chunk_ids, doc_id)
        
        # Persistent Save
        print("Saving data...")
        # faiss_store.save()
        knowledge_graph.save()
        
        print("Seeding COMPLETE successfully!")
        
        # Verify
        # print(f"Total Vectors: {faiss_store.count()}")
        print(f"Total Documents: {sqlite_store.count_documents()}")

    except Exception as e:
        print(f"Seeding FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    seed_data_direct()
