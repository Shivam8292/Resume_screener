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
        Evaluates the candidate against dynamic JD pillars.
        Returns a detailed report matching the requested high-fidelity UI.
        """
        if not self.client:
            return self._get_error_response("LLM Client not initialized.")

        pillars = structured_jd.get("pillars", [])
        
        prompt = f"""
        Act as an Elite Technical Recruiter and ATS Analyst. 
        Evaluate the Candidate against the specific Evaluation Pillars identified from the Job Description.
        
        EVALUATION PILLARS:
        {json.dumps(pillars, indent=2)}
        
        CANDIDATE DATA (Extracted):
        {json.dumps(extracted_resume, indent=2)}
        
        SCORING TASKS:
        1. Evaluate each Pillar individually (0-100%).
        2. Provide a 2-3 sentence "Reasoning" for each pillar score.
        3. Formulate an "Evidence Question" and provide the "Evidence Answer" from the resume for each pillar.
        4. Determine the overall "Status": "SHORTLIST" (Score > 75), "REVIEW" (Score 60-75), or "REJECT" (Score < 60).
        5. Extract "Contact Email" from the candidate data if present.
        
        Return ONLY a JSON object with this structure:
        {{
            "ats_score": 85,
            "status": "SHORTLIST",
            "contact_email": "candidate@email.com",
            "overall_reasoning": "Summary of the candidate fit.",
            "detailed_evaluations": [
                {{
                    "pillar_name": "Category Name",
                    "score": 90,
                    "reasoning": "Detailed paragraph explaining why.",
                    "evidence_question": "Question about the requirement?",
                    "evidence_answer": "Direct evidence from the resume.",
                    "is_strength": true
                }},
                ...
            ],
            "gaps": ["Gap 1", "Gap 2"]
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
            analysis = json.loads(content)
            
            # Map back to final_score for backend compatibility
            analysis["final_score"] = analysis.get("ats_score", 0)
            return analysis
            
        except Exception as e:
            print(f"Scoring Engine Error: {e}")
            return self._get_error_response(str(e))

    def _get_error_response(self, error_msg: str) -> dict:
        return {
            "final_score": 0,
            "ats_score": 0,
            "status": "ERROR",
            "detailed_evaluations": [],
            "overall_reasoning": f"Analysis failed: {error_msg}",
            "gaps": [error_msg]
        }

# Singleton
scoring_service = ScoringService()
