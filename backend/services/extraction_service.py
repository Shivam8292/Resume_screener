import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class ExtractionService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-2.0-flash")
        else:
            self.model = None

    def extract_resume_data(self, resume_text: str) -> dict:
        """
        Phase 4: Extract structured skills, projects, experience, and domains.
        """
        if not self.model:
            return {"skills": [], "projects": [], "experience": "0", "domains": []}

        prompt = f"""
        Act as a Professional Resume Logic Extractor. 
        Analyze the following Resume text and extract core structured data.
        
        Resume Text:
        {resume_text}
        
        Return ONLY a JSON object with this exact structure:
        {{
            "skills": ["Python", "FastAPI", "React", etc.],
            "projects": ["Detail specific project name/impact", etc.],
            "experience_years": 5.5,
            "domains": ["Fintech", "Healthtech", "E-commerce", etc.],
            "experience_level": "Senior | Mid | Junior"
        }}
        """
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            content = response.text
            return json.loads(content)
        except Exception as e:
            print(f"Resume Extraction Error: {e}")
            return {"skills": [], "projects": [], "experience_years": 0, "domains": [], "experience_level": "Junior"}

# Singleton
extraction_service = ExtractionService()
