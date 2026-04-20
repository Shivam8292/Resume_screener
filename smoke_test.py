import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from services.embedding_service import embedding_service
    from services.parsing_service import parsing_service
    from services.extraction_service import extraction_service
    from services.scoring_service import scoring_service
    from utils.text_cleaner import clean_resume_text
    
    print("SUCCESS: All services and utilities imported successfully.")
    
    # Simple check for singleton initialization
    if embedding_service and parsing_service and extraction_service and scoring_service:
        print("SUCCESS: All singletons initialized.")
    else:
        print("FAILURE: One or more services failed to initialize.")
        
except Exception as e:
    print(f"FAILURE: Import error: {e}")
    import traceback
    traceback.print_exc()
