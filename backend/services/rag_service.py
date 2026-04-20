import numpy as np
from services.embedding_service import compute_cosine_similarity

def calculate_rag_rankings(jd_embedding: np.ndarray, chunk_repository: list[dict]):
    """
    Groups chunks by filename and calculates RAG scores utilizing cosine similarity.
    Returns: { filename: { "score": float, "evidence": [str, str] } }
    """
    if not chunk_repository:
        return {}
        
    # Group chunk data
    files_data = {}
    for item in chunk_repository:
        fname = item["filename"]
        if fname not in files_data:
            files_data[fname] = {"embeddings": [], "texts": []}
        files_data[fname]["embeddings"].append(item["embedding"])
        files_data[fname].get("texts", []).append(item.get("chunk", ""))
        
    results = {}
    for fname, data in files_data.items():
        # Compute scores for all chunks of this file
        scores = compute_cosine_similarity(jd_embedding, data["embeddings"])
        
        # Zip scores with texts
        scored_chunks = sorted(zip(scores, data["texts"]), key=lambda x: x[0], reverse=True)
        
        # Take top 2 chunks as evidence
        top_2_evidence = [text for score, text in scored_chunks[:2]]
        
        # Final RAG score: average of top 2
        top_2_scores = [score for score, text in scored_chunks[:2]]
        rag_score = float(np.mean(top_2_scores)) if top_2_scores else 0.0
        
        results[fname] = {
            "score": rag_score,
            "evidence": top_2_evidence
        }
        
    return results
