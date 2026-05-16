import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class ExtractionService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    def extract_resume_data(self, resume_text: str) -> dict:
        """
        Phase 4: Extract structured skills, projects, experience, and domains.
        """
        if not self.client:
            return {"skills": [], "projects": [], "experience": "0", "domains": []}

        prompt = f"""
        Act as a Professional Resume Logic Extractor. 
        Analyze the following Resume text and extract core structured data.
        
        Resume Text:
        {resume_text}
        
        Return ONLY a JSON object with this exact structure:
        {{
            "contact_email": "example@email.com",
            "phone_number": "+1234567890",
            "skills": ["Python", "FastAPI", "React", etc.],
            "projects": ["Detail specific project name/impact", etc.],
            "experience_years": 5.5,
            "domains": ["Fintech", "Healthtech", "E-commerce", etc.],
            "experience_level": "Senior | Mid | Junior"
        }}
        """
        
        try:
            completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
                temperature=0.0,
            )
            content = completion.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Resume Extraction Error: {e}")
            return {"skills": [], "projects": [], "experience_years": 0, "domains": [], "experience_level": "Junior"}

# Singleton
extraction_service = ExtractionService()
