import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

try:
    from utils.text_cleaner import clean_resume_text
except ImportError:
    try:
        from .text_cleaner import clean_resume_text
    except ImportError:
        def clean_resume_text(t): return t

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF and clean it."""
    text = ""
    try:
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        
        if not text.strip():
            logger.warning("PyMuPDF extracted no text from the PDF.")
            
        return clean_resume_text(text)
    except Exception as e:
        logger.error(f"PyMuPDF Extraction Error: {e}")
        return ""
