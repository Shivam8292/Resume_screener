import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class ScoringService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        self.weights = {
            "frontend": 30,
            "backend": 25,
            "database": 15,
            "projects": 20,
            "extras": 10
        }

    def compute_weighted_score(self, structured_jd: dict, extracted_resume: dict) -> dict:
        """
        Phase 5, 6, 7, 8, 9, 10: The Core Intelligence Engine.
        Returns a comprehensive analysis with weighted scores, evidence, and gaps.
        """
        if not self.client:
            return self._get_error_response("LLM Client not initialized.")

        prompt = f"""
        Act as an Elite Technical Recruiter. Evaluate the following Candidate Data against the Job Requirements.
        
        JOB REQUIREMENTS (Structured):
        {json.dumps(structured_jd, indent=2)}
        
        CANDIDATE DATA (Extracted):
        {json.dumps(extracted_resume, indent=2)}
        
        CRITICAL SCORING RULES:
        1. Rate match level for each category: frontend, backend, database, projects, extras (0.0 to 1.0).
        2. Use SEMANTIC matching (React = Next.js, FastAPI = Django, etc.).
        3. Missing ONE skill should NOT heavily reduce the category score if other strengths exist.
        4. Good resumes must land in the 65-85 score range.
        5. Extract EXACT evidence lines from the resume for each core strength found.
        6. Identify SMART GAPS (e.g., "No backend framework like FastAPI detected" instead of "FastAPI missing").
        7. Assign a CONFIDENCE score (HIGH, MEDIUM, LOW) based on evidence quality.
        
        Return ONLY a JSON object with this exact structure:
        {{
            "category_scores": {{
                "frontend": 0.8,
                "backend": 0.5,
                "database": 0.9,
                "projects": 0.7,
                "extras": 0.6
            }},
            "strengths": [
                {{ "skill": "React Development", "evidence": "Developed 15+ reusable React components..." }}
            ],
            "gaps": ["No backend framework like FastAPI/Django detected", etc.],
            "rationale": "2-3 line factual explanation.",
            "confidence": "HIGH | MEDIUM | LOW"
        }}
        """
        
        try:
            completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
            )
            content = completion.choices[0].message.content
            analysis = json.loads(content)
            
            # Phase 5: Map category scores to weights and Compute Final Weighted Score
            total_score = 0
            cat_scores = analysis.get("category_scores", {})
            for cat, weight in self.weights.items():
                score = cat_scores.get(cat, 0)
                total_score += (score * weight)
            
            # Normalize to 0-100 (since weights sum to 100)
            analysis["final_score"] = round(total_score, 1)
            
            return analysis
            
        except Exception as e:
            print(f"Scoring Engine Error: {e}")
            return self._get_error_response(str(e))

    def _get_error_response(self, error_msg: str) -> dict:
        return {
            "final_score": 0,
            "category_scores": {},
            "strengths": [],
            "gaps": [f"Scoring error: {error_msg}"],
            "rationale": "Analysis failed due to a system error.",
            "confidence": "LOW"
        }

# Singleton
scoring_service = ScoringService()
