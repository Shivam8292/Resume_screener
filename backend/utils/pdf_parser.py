import fitz  # PyMuPDF

from .text_cleaner import clean_resume_text

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF and clean it."""
    text = ""
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    
    return clean_resume_text(text)
