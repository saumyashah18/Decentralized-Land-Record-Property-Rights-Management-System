
"""
Seed Data Script for Bhoomika AI Assistant
Populates the database with initial land and property rights information.
"""
import sys
import os

# Add current directory to path to ensure imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from pipeline import get_ingestion_pipeline
except Exception as e:
    with open("startup_error.txt", "w") as f:
        f.write(f"Startup Import Error: {e}\n")
    print(f"Startup Import Error: {e}")
    sys.exit(1)

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

def seed_data():
    print("Seeding Bhoomika Knowledge Base...")
    
    try:
        print("Getting ingestion pipeline...")
        ingestion = get_ingestion_pipeline()
        
        print("Ingesting sample content...")
        # Ingest the sample content
        doc_id = ingestion.ingest_text(
            text=LAND_LAWS_CONTENT,
            title="Indian Land Laws & BhoomiSetu Guide",
            description="Core legal provisions and platform usage guide"
        )
        
        print(f"Successfully ingested document ID: {doc_id}")
        
        stats = ingestion.get_stats()
        print("Current Database Stats:")
        for k, v in stats.items():
            print(f"- {k}: {v}")
    
    except ImportError as e:
        with open("debug_log.txt", "w") as f:
            f.write(f"Import Error: {e}\n")
            f.write("Please check your dependencies.\n")
        print(f"Import Error: {e}")
    except Exception as e:
        import traceback
        with open("debug_log.txt", "w") as f:
            f.write(f"Error seeding data: {e}\n")
            traceback.print_exc(file=f)
        print(f"Error seeding data: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    seed_data()
