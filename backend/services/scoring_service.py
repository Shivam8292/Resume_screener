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
        2. ONLY reward points if the exact or semantically equivalent skill is found in the Candidate Data. 
        3. STRICT PENALTY: If a key technology from the JD (e.g., Java, System Design) is COMPLETELY MISSING from the resume, the category score MUST be 0.0 to 0.3 maximum. Do NOT assume they know it.
        4. MANDATORY FLOOR: If a skill from the JD *is* present, the category score MUST be at least 0.85.
        5. IGNORE SENIORITY BIAS: Do NOT deduct points because the candidate is a student or 'Junior' if they actually have the skills.
        6. Extract EXACT evidence lines from the resume. If there is no evidence for a JD requirement, explicitly list it under "gaps".
        7. CONFIDENCE: HIGH (Clear evidence), MEDIUM (Implied), LOW (Many missing items).
        
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
            
            # Phase 5: Dynamic Weighting Fix
            # Only count weights for categories that have requirements in the JD
            # 'projects' is always active (20%)
            active_weights = {"projects": 20}
            for cat in ["frontend", "backend", "database", "extras"]:
                if structured_jd.get(cat):
                    active_weights[cat] = self.weights[cat]
            
            total_active_weight = sum(active_weights.values())
            
            # Compute Final Weighted Score using active categories only
            weighted_sum = 0
            cat_scores = analysis.get("category_scores", {})
            
            for cat, weight in active_weights.items():
                score = cat_scores.get(cat, 0)
                weighted_sum += (score * weight)
            
            # Normalize based on active weights (e.g., if only Frontend/Backend/Projects active, divide by 75)
            final_normalized = (weighted_sum / total_active_weight) * 100 if total_active_weight > 0 else 0
            
            analysis["final_score"] = round(final_normalized, 1)
            
            # Add metadata for debugging
            analysis["active_categories"] = list(active_weights.keys())
            
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
