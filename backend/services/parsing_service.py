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
        Act as a Senior Recruitment Architect. 
        Analyze the following Job Description (JD) and identify the 4-6 most critical "Evaluation Pillars" for this role.
        
        Job Description:
        {jd_text}
        
        Rules:
        1. Identify specific categories (e.g., "Frontend Architecture", "Core Java Expertise", "Project Leadership", "DevOps & Scaling").
        2. Do NOT use generic "frontend", "backend" unless the JD is specifically structured that way.
        3. For each pillar, list the specific requirements/skills found in the JD.
        
        Return ONLY a JSON object with this structure:
        {{
            "pillars": [
                {{
                    "name": "Category Name",
                    "requirements": ["Skill 1", "Skill 2"]
                }},
                ...
            ]
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
            return {"pillars": [{"name": "Technical Skills", "requirements": []}]}

# Singleton
parsing_service = ParsingService()
