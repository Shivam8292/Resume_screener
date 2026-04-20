import re

def clean_resume_text(text: str) -> str:
    """
    Cleans extracted resume text while preserving structure.
    - Removes excessive noise and extra whitespaces.
    - Normalizes bullet points.
    - Preserves section headers by ensuring they are on new lines.
    """
    # 1. Normalize line endings
    text = text.replace('\r', '\n')
    
    # 2. Remove non-printable characters but keep standard punctuation
    text = re.sub(r'[^\x20-\x7E\n]', ' ', text)
    
    # 3. Normalize bullet points to a standard '-'
    text = re.sub(r'^[ \t]*[•●○*][ \t]*', '- ', text, flags=re.MULTILINE)
    
    # 4. Handle section headers (heuristically detect common headers like SKILLS, EXPERIENCE)
    # Ensure they have double new lines before them for better separation
    headers = [
        r'SKILLS?', r'EXPERIENCE', r'WORK EXPERIENCE', r'EDUCATION', 
        r'PROJECTS?', r'ACHIEVEMENTS?', r'SUMMARY', r'OBJECTIVE', 
        r'CERTIFICATIONS?', r'LANGUAGES?'
    ]
    for header in headers:
        # Match headers that are likely on their own line or start a line (case insensitive)
        pattern = rf'(\n[ \t]*({header})[ \t]*[:\-\n])'
        text = re.sub(pattern, r'\n\n\2:\n', text, flags=re.IGNORECASE)

    # 5. Collapse excessive newlines (max 2)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # 6. Collapse excessive spaces
    text = re.sub(r' +', ' ', text)
    
    return text.strip()
