"""
Database Migration Script: Add chunk_type column to chunks table
Run this to migrate existing database to support multi-granularity chunking
"""
import sqlite3
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import SQLITE_DB_PATH


def migrate_database():
    """Add chunk_type column to chunks table and filepath to documents table"""
    
    print(f"Migrating database: {SQLITE_DB_PATH}")
    
    if not os.path.exists(SQLITE_DB_PATH):
        print("Database does not exist yet. No migration needed.")
        return
    
    # Backup database first
    backup_path = SQLITE_DB_PATH + ".backup"
    import shutil
    if os.path.exists(backup_path):
        os.remove(backup_path)
    shutil.copy2(SQLITE_DB_PATH, backup_path)
    print(f"✓ Created backup: {backup_path}")
    
    # Connect to database
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()
    
    try:
        migrations_done = []
        
        # Check and add filepath column to documents table
        cursor.execute("PRAGMA table_info(documents)")
        doc_columns = [col[1] for col in cursor.fetchall()]
        
        if 'filepath' not in doc_columns:
            print("Adding filepath column to documents table...")
            cursor.execute("ALTER TABLE documents ADD COLUMN filepath TEXT")
            migrations_done.append("Added filepath column to documents")
        else:
            print("✓ filepath column already exists in documents table")
        
        # Check and add chunk_type column to chunks table
        cursor.execute("PRAGMA table_info(chunks)")
        chunk_columns = [col[1] for col in cursor.fetchall()]
        
        if 'chunk_type' not in chunk_columns:
            print("Adding chunk_type column to chunks table...")
            cursor.execute("ALTER TABLE chunks ADD COLUMN chunk_type TEXT DEFAULT 'M'")
            cursor.execute("UPDATE chunks SET chunk_type = 'M' WHERE chunk_type IS NULL")
            migrations_done.append("Added chunk_type column to chunks")
        else:
            print("✓ chunk_type column already exists in chunks table")
        
        if migrations_done:
            conn.commit()
            print("\n✓ Migration completed successfully!")
            for migration in migrations_done:
                print(f"  - {migration}")
        else:
            print("\n✓ No migrations needed. Database is up to date.")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
        raise
    
    finally:
        conn.close()


if __name__ == "__main__":
    print("="*60)
    print("Database Migration: Multi-Granularity Chunking Support")
    print("="*60)
    migrate_database()
    print("="*60)
