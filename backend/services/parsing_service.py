import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class ParsingService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    def parse_job_description(self, jd_text: str) -> dict:
        """
        Phase 3: Convert JD into structured categories.
        """
        if not self.client:
            return {"frontend": [], "backend": [], "database": [], "projects": [], "extras": []}

        prompt = f"""
        Act as a Technical Architecture Parser. 
        Categorize the following Job Description (JD) into specific technical requirements.
        
        Job Description:
        {jd_text}
        
        Return ONLY a JSON object with this exact structure:
        {{
            "frontend": ["React", "Tailwind", etc.],
            "backend": ["Python", "FastAPI", "API Design", etc.],
            "database": ["PostgreSQL", "SQL", "Redis", etc.],
            "projects": ["SaaS development", "E-commerce", etc.],
            "extras": ["Docker", "CI/CD", "Testing", etc.]
        }}
        """
        
        try:
            completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
            )
            content = completion.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"JD Parsing Error: {e}")
            return {"frontend": [], "backend": [], "database": [], "projects": [], "extras": []}

# Singleton
parsing_service = ParsingService()
