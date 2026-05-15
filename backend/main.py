from __future__ import annotations
import asyncio
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import numpy as np
import json
import logging
from dotenv import load_dotenv

# Load Environment
load_dotenv()

# Internal Imports
from utils.pdf_parser import extract_text_from_pdf
from utils.chunking import chunk_text
from services.embedding_service import embedding_service
from services.parsing_service import parsing_service
from services.extraction_service import extraction_service
from services.scoring_service import scoring_service

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://ngexukqvudjsyhkwovmx.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") or "sb_publishable_m0zc0T2UIo7X3LZ7mTEwjg_LMjlMztQ" 

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI(title="AI Resume Screener API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (Hydrated from Supabase on startup)
chunk_repository: list[dict] = []
resume_full_texts: dict[str, str] = {}
latest_rankings: list[dict] = []

@app.on_event("startup")
async def startup_event():
    # Only fetch metadata (filenames) to make startup INSTANT
    try:
        res = supabase.table("resumes").select("filename").execute()
        for r in res.data:
            if r["filename"] not in resume_full_texts:
                resume_full_texts[r["filename"]] = None # Mark as existing but not loaded
        logger.info(f"Startup Complete: {len(resume_full_texts)} resumes indexed.")
    except Exception as e:
        logger.error(f"Startup metadata fetch failed: {str(e)}")

class RankRequest(BaseModel):
    job_description: str
    filenames: list[str] = None # Optional: Filter by specific files

class CompareRequest(BaseModel):
    job_description: str
    candidates: list[str]

class ImproveRequest(BaseModel):
    job_description: str
    filename: str

@app.get("/resumes")
async def get_uploaded_resumes():
    """Returns filenames. If memory is empty (cold start), it fetches from Supabase."""
    global resume_full_texts
    if not resume_full_texts:
        try:
            logger.info("Memory empty, fetching filenames from Supabase...")
            res = supabase.table("resumes").select("filename").execute()
            for r in res.data:
                if r["filename"] not in resume_full_texts:
                    resume_full_texts[r["filename"]] = None
        except Exception as e:
            logger.error(f"On-demand fetch failed: {str(e)}")
    
    return {"resumes": list(resume_full_texts.keys())}

@app.get("/")
def health_check():
    return {"status": "healthy", "version": "v15.1-stable"}

@app.post("/upload-resumes")
async def upload_resumes(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
        
    try:
        logger.info(f"--- Starting Super-Batch Upload Process for {len(files)} files ---")
        
        # 1. Parallel Text Extraction
        async def get_file_content(file: UploadFile):
            fname = file.filename
            try:
                content = await file.read()
                text = await asyncio.to_thread(extract_text_from_pdf, content)
                return {"filename": fname, "text": text, "error": None}
            except Exception as e:
                return {"filename": fname, "text": "", "error": str(e)}

        file_results = await asyncio.gather(*[get_file_content(f) for f in files])
        
        all_resumes_to_upsert = []
        all_chunks_to_insert = []
        all_text_to_embed = []
        chunk_mapping = [] # To map embeddings back to files
        processing_errors = []

        for res in file_results:
            fname = res["filename"]
            if res["error"]:
                processing_errors.append(res["error"])
                continue
            
            text = res["text"]
            if not text.strip():
                processing_errors.append(f"{fname}: No readable text")
                continue
            
            # Prepare Resume Data
            all_resumes_to_upsert.append({"filename": fname, "full_text": text})
            resume_full_texts[fname] = text
            
            # Prepare Chunks for this file
            chunks = chunk_text(text)
            for c_text in chunks:
                all_text_to_embed.append(c_text)
                chunk_mapping.append({"filename": fname, "text": c_text})

        if not all_text_to_embed:
            error_msg = "; ".join(processing_errors) if processing_errors else "No valid text found"
            raise HTTPException(status_code=400, detail=f"Upload Failed: {error_msg}")

        # 2. Batch Embedding Generation (Processed in chunks to prevent API timeouts)
        logger.info(f"Generating embeddings for TOTAL {len(all_text_to_embed)} chunks across all files...")
        all_embeddings = []
        BATCH_SIZE = 25 # Process 25 chunks at a time for optimal reliability
        
        for i in range(0, len(all_text_to_embed), BATCH_SIZE):
            batch = all_text_to_embed[i:i + BATCH_SIZE]
            batch_embeddings = await asyncio.to_thread(embedding_service.get_embeddings, batch)
            if not batch_embeddings:
                raise HTTPException(status_code=500, detail=f"Embedding generation failed at batch {i//BATCH_SIZE}")
            all_embeddings.extend(batch_embeddings)
        
        if len(all_embeddings) != len(all_text_to_embed):
            raise HTTPException(status_code=500, detail="Incomplete embedding generation")

        # 3. Prepare Bulk Data for Database
        filenames_to_clean = [r["filename"] for r in all_resumes_to_upsert]
        
        for i, emb in enumerate(all_embeddings):
            meta = chunk_mapping[i]
            all_chunks_to_insert.append({
                "filename": meta["filename"],
                "chunk_text": meta["text"],
                "embedding": emb.tolist()
            })
            
            # Update local memory repository
            chunk_repository.append({
                "filename": meta["filename"],
                "chunk": meta["text"],
                "embedding": emb
            })

        # 4. Bulk Database Operations
        logger.info(f"Executing bulk database operations for {len(all_resumes_to_upsert)} resumes...")
        
        # Delete old chunks for these files in one go
        supabase.table("chunks").delete().in_("filename", filenames_to_clean).execute()
        
        # Upsert all resumes
        supabase.table("resumes").upsert(all_resumes_to_upsert).execute()
        
        # Insert all chunks in bulk
        if all_chunks_to_insert:
            # Note: Supabase/PostgREST handles large bulk inserts well
            supabase.table("chunks").insert(all_chunks_to_insert).execute()
            
        logger.info("Super-Batch processing complete.")

        return {
            "count": len(all_resumes_to_upsert), 
            "chunks": len(all_chunks_to_insert), 
            "status": "success",
            "errors": processing_errors
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"CRITICAL Super-Batch Upload error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/compare")
async def compare_candidates_endpoint(request: CompareRequest):
    """
    Generate a qualitative comparison between two candidates using Groq.
    """
    try:
        if len(request.candidates) != 2:
            raise HTTPException(status_code=400, detail="Must provide exactly two candidates for comparison.")

        # 1. Gather data for both candidates
        comparison_data = {}
        for fname in request.candidates:
            text = resume_full_texts.get(fname)
            if not text:
                raise HTTPException(status_code=404, detail=f"Candidate data for {fname} not found.")
            
            # Extract data for context
            extracted = await asyncio.to_thread(extraction_service.extract_resume_data, text)
            # Get score
            analysis = await asyncio.to_thread(scoring_service.compute_weighted_score, 
                                             parsing_service.parse_job_description(request.job_description), 
                                             extracted)
            
            comparison_data[fname] = {
                "filename": fname,
                "final_score": analysis.get("final_score", 0),
                "experience_years": extracted.get("experience_years", 0),
                "matched_skills": extracted.get("skills", [])[:5] # Top 5 skills
            }

        # 2. Use LLM for Qualitative "Reason"
        from groq import Groq
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""
        Act as a Senior Hiring Manager. Compare these two candidates for the Job Description.
        
        JD: {request.job_description}
        
        Candidate A ({request.candidates[0]}): {json.dumps(comparison_data[request.candidates[0]])}
        Candidate B ({request.candidates[1]}): {json.dumps(comparison_data[request.candidates[1]])}
        
        Provide a 2-3 sentence verdict on who is better and WHY. 
        Return JSON with:
        - reason: "The qualitative verdict"
        - better_candidate: "The filename of the winner"
        """
        
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        
        verdict = json.loads(completion.choices[0].message.content)
        
        return {
            "reason": verdict.get("reason"),
            "better_candidate": verdict.get("better_candidate"),
            "comparison": comparison_data
        }

    except Exception as e:
        logger.error(f"Comparison Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

@app.post("/rank")
async def rank_resumes(request: RankRequest):
    """
    Refined /rank endpoint (Phase 11-13).
    Implements weighted scoring, evidence mapping, and structured ranking.
    """
    try:
        # State Recovery: Fetch all texts if memory is empty or entries are not loaded
        global resume_full_texts
        needs_fetch = not resume_full_texts or any(v is None for v in resume_full_texts.values())
        
        if needs_fetch:
            logger.info("Fetching full resume texts from Supabase for analysis...")
            response = supabase.table("resumes").select("filename, full_text").execute()
            if response.data:
                for item in response.data:
                    resume_full_texts[item['filename']] = item['full_text']
                logger.info(f"Loaded {len(response.data)} resumes into memory.")

        if not resume_full_texts:
            raise HTTPException(status_code=400, detail="No resumes found. Please upload resumes first.")
        
        if not request.job_description.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty.")

        logger.info(f"--- Starting Recruiter-Grade Analysis Pipeline ---")
        
        # 1. Phase 3: Parse JD into Categories
        structured_jd = await asyncio.to_thread(parsing_service.parse_job_description, request.job_description)
        logger.info(f"JD Parsed into categories: {list(structured_jd.keys())}")
        
        # 2. Phase 4: Extract Resume Data + Phase 5-10: Score (Parallel for all candidates)
        # Filter: If specific filenames are requested, only process those. 
        requested_files = request.filenames
        if requested_files is not None and len(requested_files) > 0:
            logger.info(f"Targeted analysis requested for: {requested_files}")
            all_known_files = list(resume_full_texts.keys())
            filenames = [f for f in all_known_files if f in requested_files]
            
            if not filenames:
                logger.error(f"None of the requested files {requested_files} found in {all_known_files}")
                raise HTTPException(status_code=404, detail="Requested resumes not found in memory.")
        else:
            logger.info("Batch analysis requested for all resumes.")
            filenames = list(resume_full_texts.keys())
        
        async def analyze_candidate(fname: str, full_text: str):
            try:
                # Phase 4: Structure Extraction
                extracted_data = await asyncio.to_thread(extraction_service.extract_resume_data, full_text)
                
                # Phase 5-10: Weighted Scoring & Evidence Mapping
                analysis = await asyncio.to_thread(scoring_service.compute_weighted_score, structured_jd, extracted_data)
                
                # Add metadata
                analysis["filename"] = fname
                analysis["name"] = fname.replace(".pdf", "")
                
                # Merge with extraction for UI
                analysis["skills"] = extracted_data.get("skills", [])
                analysis["projects"] = extracted_data.get("projects", [])
                analysis["experience_years"] = extracted_data.get("experience_years", 0)
                analysis["experience_level"] = extracted_data.get("experience_level", "Mid")
                
                return analysis
            except Exception as e:
                logger.error(f"Analysis failure for {fname}: {e}")
                return None

        # Process in parallel with fault tolerance
        analysis_tasks = [analyze_candidate(f, resume_full_texts[f]) for f in filenames]
        results = await asyncio.gather(*analysis_tasks)
        
        # Filter failures and finalize Phase 11 Ranking
        final_results = [r for r in results if r is not None]
        final_results.sort(key=lambda x: x.get("final_score", 0), reverse=True)
        
        return final_results

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"CRITICAL Rank Error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Ranking Pipeline Failed: {str(e)}")

@app.post("/improve-resume")
async def improve_resume_endpoint(request: ImproveRequest):
    """
    Endpoint for Phase 12: ATS Optimizer.
    Suggests improvements based on structured analysis.
    """
    try:
        resume_text = resume_full_texts.get(request.filename)
        if not resume_text:
            raise HTTPException(status_code=404, detail=f"Resume {request.filename} not found.")

        # Re-use extraction to see what we have
        extracted_data = await asyncio.to_thread(extraction_service.extract_resume_data, resume_text)
        
        # Use LLM to suggest improvements against the specific JD categories
        from groq import Groq
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""
        Act as an Elite Career Coach. Optimize this Resume for the Job Description.
        
        JD: {request.job_description}
        Extracted Data: {json.dumps(extracted_data)}
        
        Return JSON with:
        - improved_points: list of rewritten bullet points.
        - missing_keywords: list of ATS keywords to add.
        - suggestions: general strategic advice.
        """
        
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        return json.loads(completion.choices[0].message.content)
        
    except Exception as e:
        logger.error(f"Improvement Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.delete("/delete-resume")
async def delete_resume(filename: str):
    """Deletes a specific resume and its chunks using a query parameter for robustness."""
    try:
        logger.info(f"Attempting to delete: {filename}")
        # 1. Delete from Supabase
        # Note: We use .execute() and check for error status in result if needed
        supabase.table("chunks").delete().eq("filename", filename).execute()
        supabase.table("resumes").delete().eq("filename", filename).execute()
        
        # 2. Clear from memory
        if filename in resume_full_texts:
            del resume_full_texts[filename]
        
        global chunk_repository
        chunk_repository = [c for c in chunk_repository if c["filename"] != filename]
        
        return {"status": "success", "message": f"Deleted {filename}"}
    except Exception as e:
        logger.error(f"Delete error for {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete {filename}: {str(e)}")

@app.post("/clear-data")
async def clear_all_data():
    """Clears all resumes and chunks from the system."""
    try:
        logger.info("CRITICAL: Clearing all cloud and memory data...")
        # To delete all rows with the anon key and RLS disabled, 
        # we can use a filter that matches everything.
        supabase.table("chunks").delete().neq("filename", "!!!NOT_A_FILE!!!").execute()
        supabase.table("resumes").delete().neq("filename", "!!!NOT_A_FILE!!!").execute()
        
        # Reset memory
        resume_full_texts.clear()
        chunk_repository.clear()
        
        return {"status": "success", "message": "All data cleared"}
    except Exception as e:
        logger.error(f"Clear All error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Clear All failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
