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
from services.embedding_service import get_embeddings
from services.llm_service import analyze_resume, compare_candidates
from services.rag_service import calculate_rag_rankings

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
    # Hydrate memory from Supabase
    try:
        # 1. Fetch Resumes
        res_resumes = supabase.table("resumes").select("*").execute()
        for r in res_resumes.data:
            resume_full_texts[r["filename"]] = r["full_text"]
        
        # 2. Fetch Chunks
        res_chunks = supabase.table("chunks").select("*").execute()
        for c in res_chunks.data:
            # Embedding is stored as a list in JSONB format in Supabase
            embedding = np.array(c["embedding"], dtype=np.float32)
            chunk_repository.append({
                "filename": c["filename"],
                "chunk": c["chunk_text"],
                "embedding": embedding
            })
            
        logger.info(f"Supabase Hydration Complete: {len(resume_full_texts)} resumes, {len(chunk_repository)} chunks.")
    except Exception as e:
        logger.error(f"Failed to hydrate from Supabase: {str(e)}")

class RankRequest(BaseModel):
    job_description: str

class CompareRequest(BaseModel):
    job_description: str
    candidates: list[str]

class ImproveRequest(BaseModel):
    job_description: str
    filename: str

@app.get("/resumes")
async def get_uploaded_resumes():
    """Returns the list of filenames currently in the persistent cloud database."""
    return {"resumes": list(resume_full_texts.keys())}

@app.get("/")
def health_check():
    return {"status": "healthy"}

@app.post("/upload-resumes")
async def upload_resumes(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
        
    try:
        logger.info(f"--- Starting Supabase Upload Process for {len(files)} files ---")
        new_chunks_count = 0
        processing_errors = []

        for file in files:
            fname = file.filename
            logger.info(f"Processing candidate file: {fname}")
            
            try:
                content = await file.read()
                if not content:
                    processing_errors.append(f"{fname}: File is empty")
                    continue
                    
                # Extract text
                text = await asyncio.to_thread(extract_text_from_pdf, content)
                
                if not text.strip():
                    processing_errors.append(f"{fname}: No readable text (might be scanned/image-only PDF)")
                    continue
                    
                # 1. Save to Supabase (Metadata)
                supabase.table("resumes").upsert({"filename": fname, "full_text": text}).execute()
                resume_full_texts[fname] = text
                
                # Chunk text
                chunks = chunk_text(text)
                if not chunks:
                    processing_errors.append(f"{fname}: Text too short to process")
                    continue
                
                # Generate embeddings
                logger.info(f"Generating embeddings for {len(chunks)} chunks of {fname}")
                embeddings = await asyncio.to_thread(get_embeddings, chunks)
                
                if not embeddings or len(embeddings) != len(chunks):
                    processing_errors.append(f"{fname}: Embedding generation mismatch or failure")
                    continue
                
                # 2. Save Chunks + Embeddings to Supabase
                # Clean old chunks if re-uploading
                supabase.table("chunks").delete().eq("filename", fname).execute()
                
                chunk_data_to_insert = []
                for i, chunk_content in enumerate(chunks):
                    emb = embeddings[i]
                    # We store embedding as a list for JSONB compatibility
                    chunk_data_to_insert.append({
                        "filename": fname,
                        "chunk_text": chunk_content,
                        "embedding": emb.tolist()
                    })
                    
                    chunk_repository.append({
                        "filename": fname,
                        "chunk": chunk_content,
                        "embedding": emb
                    })
                    new_chunks_count += 1
                
                if chunk_data_to_insert:
                    supabase.table("chunks").insert(chunk_data_to_insert).execute()
                    
                logger.info(f"Successfully processed and stored {fname} in Supabase")
                
            except Exception as file_error:
                error_msg = f"{fname}: {str(file_error)}"
                logger.error(f"Failed to process file {fname}: {error_msg}")
                processing_errors.append(error_msg)
                continue
                
        logger.info(f"Batch processing complete. Total new chunks added: {new_chunks_count}")
        
        if new_chunks_count == 0:
            error_details = "; ".join(processing_errors) if processing_errors else "Unknown processing error"
            raise HTTPException(
                status_code=400, 
                detail=f"Upload Failed: {error_details}"
            )

        return {
            "count": len(files), 
            "chunks": new_chunks_count, 
            "status": "success",
            "errors": processing_errors # Return partial errors if any
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"CRITICAL Upload error: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/rank")
async def rank_resumes(request: RankRequest):
    """
    Main entry point for Phase 1: Semantic Embedding Ranking.
    Replaces keyword matching with full vector-based similarity scoring.
    """
    try:
        if not chunk_repository:
            raise HTTPException(status_code=400, detail="No resumes uploaded. Please upload resumes first.")
        
        if not request.job_description.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty.")

        logger.info(f"--- Starting Phase 1 Semantic Ranking ---")
        
        # 1. Generate Embeddings for Job Description
        # This converts user requirements into a mathematical vector
        try:
            jd_embeddings = await asyncio.to_thread(get_embeddings, [request.job_description])
            if not jd_embeddings:
                raise ValueError("Embedding engine returned no data")
            jd_embedding = jd_embeddings[0]
        except Exception as e:
            logger.error(f"JD Embedding Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Embedding Provider Failure: {str(e)}")
        
        # 2. Compute Semantic RAG Rankings (Similarity with resume chunks)
        try:
            rag_data = calculate_rag_rankings(jd_embedding, chunk_repository)
        except Exception as e:
            logger.error(f"RAG Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"RAG Engine Failure: {str(e)}")
        
        # 3. LLM Qualitative Analysis (Phase 5: Parallel Optimization)
        filenames = list(resume_full_texts.keys())
        
        # We use return_exceptions=True to ensure one failure doesn't crash the batch
        llm_results = await asyncio.gather(*[
            asyncio.to_thread(analyze_resume, request.job_description, resume_full_texts[f])
            for f in filenames
        ], return_exceptions=True)
        
        # 4. Normalize Scores (0-100) and Merge Data
        results = []
        for i, fname in enumerate(filenames):
            try:
                llm = llm_results[i]
                if isinstance(llm, Exception):
                    logger.error(f"LLM failure for {fname}: {str(llm)}")
                    continue
                    
                rag = rag_data.get(fname, {"score": 0.0, "evidence": []})
                
                # Convert 0-1 similarity to 0-100 score
                semantic_score_100 = rag["score"] * 100
                ai_score = llm.get("score", 0)
                
                # Hybrid Scorer: 70% Semantic Vector Similarity + 30% LLM Reasoner
                final_score = (0.7 * semantic_score_100) + (0.3 * ai_score)
                
                results.append({
                    "filename": fname,
                    "final_score": round(final_score, 1),
                    "similarity_score": round(semantic_score_100, 1),
                    "ai_score": round(ai_score, 1),
                    "rationale": llm.get("rationale", ""),
                    "strengths": llm.get("strengths", []),
                    "gaps": llm.get("gaps", []),
                    "summary": llm.get("summary", ""),
                    "skills": llm.get("skills", []),
                    "experience_level": llm.get("experience_level", "N/A"),
                    "projects": llm.get("projects", []),
                    "experience_years": llm.get("experience_years", 0),
                    "meets_experience": llm.get("experience_years", 0) >= llm.get("required_experience", 0),
                    "evidence": rag.get("evidence", []),
                    "decision": llm.get("decision", "Reject")
                })
            except Exception as e:
                logger.error(f"Processing error for {fname}: {str(e)}")
                continue
        
        # 5. Sort candidates by Normalized Score
        results.sort(key=lambda x: x["final_score"], reverse=True)
        
        global latest_rankings
        latest_rankings = results[:10]
        
        for idx, item in enumerate(latest_rankings):
            item["rank"] = idx + 1
            
        return latest_rankings

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"CRITICAL Pipeline Failure: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal Pipeline Error: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"CRITICAL Rank Error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Ranking Pipeline Failed: {str(e)}")

@app.post("/improve-resume")
async def improve_resume_endpoint(request: ImproveRequest):
    """
    Endpoint for Phase 4: ATS Optimizer.
    Suggests improvements for a specific resume.
    """
    try:
        resume_text = resume_full_texts.get(request.filename)
        if not resume_text:
            raise HTTPException(status_code=404, detail=f"Resume {request.filename} not found.")

        from services.llm_service import improve_resume
        res = await asyncio.to_thread(improve_resume, request.job_description, resume_text)
        return res
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
