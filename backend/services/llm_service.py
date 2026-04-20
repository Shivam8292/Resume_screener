import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def get_groq_key():
    key = os.getenv("GROQ_API_KEY")
    if not key:
        # Fallback check for common mistake where key is pasted as raw string in .env
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                first_line = f.readline().strip()
                if first_line.startswith("gsk_"):
                    return first_line.split()[0]
    return key

client = None
try:
    groq_api_key = get_groq_key()
    if groq_api_key:
        client = Groq(api_key=groq_api_key)
    else:
        print("WARNING: GROQ_API_KEY not found in environment.")
except Exception as e:
    print(f"Error initializing Groq client: {e}")

def analyze_resume(job_description: str, resume_text: str):
    """
    Analyzes a resume against a job description using LLM reasoning (Phase 2).
    Extracts structured skills, projects, and evaluates conceptual gaps.
    """
    
    prompt = f"""
    Act as an Expert Technical Recruiter specializing in Intelligent Skill Mapping.
    Analyze the following Resume against the Job Description (JD).
    
    CRITICAL INSTRUCTIONS:
    1. Do NOT use simple keyword matching. Use CONCEPTUAL mapping. 
       (e.g., if JD asks for 'FastAPI' and candidate has 'Django', they match 'Backend Frameworks').
    2. Extract specific 'projects' that demonstrate core skills.
    3. Evaluate 'experience_level' as Junior, Mid, or Senior.
    
    Job Description:
    {job_description}
    
    Resume:
    {resume_text}
    
    Return ONLY a JSON object with:
    - score: 0-100 (Integer)
    - rationale: 2-3 line factual explanation. (e.g., "Matches core frontend requirements but lacks backend experience.")
    - strengths: list of strings (Matched conceptual skills and achievements)
    - gaps: list of strings (Missing required skills or significant weaknesses)
    - summary: 2-sentence explanation of the fit.
    - skills: list of technical skills found.
    - experience_level: "Junior", "Mid", "Senior", or "Expert"
    - projects: list of notable projects found.
    - experience_years: total years of experience.
    - required_experience: years mentioned in JD.
    - decision: "Shortlist" or "Reject"
    """
    
    if not client:
        return {
            "score": 0, "rationale": "Groq client not initialized.", "strengths": [], "gaps": [], 
            "summary": "N/A", "skills": [], "experience_level": "N/A", "projects": [],
            "experience_years": 0, "required_experience": 0, "decision": "Reject"
        }

    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty response from LLM")
        
        analysis = json.loads(content)
        
        # Ensure Phase 3 fields exist
        defaults = {
            "score": 0, "rationale": "No rationale provided", "strengths": [], "gaps": [], 
            "summary": "Analysis failed", "skills": [], "experience_level": "N/A", "projects": [],
            "experience_years": 0, "required_experience": 0, "decision": "Reject"
        }
        for key, val in defaults.items():
            if key not in analysis:
                analysis[key] = val
                
        return analysis
        
    except Exception as e:
        print(f"Phase 2 Analysis error: {e}")
        return {
            "score": 0, "strengths": [], "gaps": ["Analysis error happened"], 
            "summary": f"Could not analyze: {str(e)}",
            "skills": [], "experience_level": "Error", "projects": [],
            "experience_years": 0, "required_experience": 0, "decision": "Reject"
        }

def compare_candidates(job_description: str, candidate_a: dict, candidate_b: dict):
    """Compare two candidates."""
    prompt = f"""
    Compare Candidate A ({candidate_a['filename']}) and Candidate B ({candidate_b['filename']}) for this JD:
    {job_description}
    
    Data A: {json.dumps(candidate_a)}
    Data B: {json.dumps(candidate_b)}
    
    Return JSON:
    {{ "better_candidate": "filename", "reason": "concise explanation" }}
    """
    if not client:
        return {"better_candidate": "N/A", "reason": "Groq client not initialized"}

    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty response from Groq")
        return json.loads(content)
    except Exception as e:
        print(f"Groq compare error: {e}")
        return {"better_candidate": "N/A", "reason": f"Error comparing: {str(e)}"}
