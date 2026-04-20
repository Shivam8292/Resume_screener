import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

# Embedding Model Configuration
# We use sentence-transformers as a robust open-source alternative to OpenAI
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_TOKEN", "")

# Initialize Inference Client
# Modular initialization allows for easy swapping of providers (OpenAI/Azure/HF)
try:
    client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)
except Exception as e:
    print(f"Warning: InferenceClient initialization failed: {e}")
    client = None

def get_embeddings(texts: list[str]) -> list[np.ndarray]:
    """
    Convert a list of strings into semantic embeddings.
    Returns a list of numpy arrays representing the text vectors.
    """
    if not texts or not client:
        return []
    
    try:
        # feature_extraction returns the hidden states (embeddings)
        embeddings = client.feature_extraction(texts)
        
        # Normalize output format to always be a list of 1D numpy arrays
        if isinstance(embeddings, np.ndarray):
            if embeddings.ndim == 1:
                return [embeddings]
            return [v for v in embeddings]
        
        return [np.array(v) for v in embeddings]
        
    except Exception as e:
        print(f"Embedding Provider Error: {str(e)}")
        raise RuntimeError(f"Semantic encoding failed: {str(e)}")

def compute_cosine_similarity(query_vec: np.ndarray, doc_vecs: list[np.ndarray]) -> list[float]:
    """
    Compute cosine similarity between a query vector and multiple document vectors.
    Returns scores as a list of floats.
    """
    if not doc_vecs:
        return []
    
    # Reshape for sklearn compatibility
    q = query_vec.reshape(1, -1)
    d = np.vstack(doc_vecs)
    
    similarities = cosine_similarity(q, d)
    return similarities[0].tolist()
