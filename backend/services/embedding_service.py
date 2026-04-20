import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from openai import OpenAI

load_dotenv()

class EmbeddingService:
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.hf_token = os.getenv("HF_TOKEN", "")
        self.hf_model = "sentence-transformers/all-MiniLM-L6-v2"
        
        # Initialize clients
        self.openai_client = OpenAI(api_key=self.openai_key) if self.openai_key else None
        self.hf_client = InferenceClient(model=self.hf_model, token=self.hf_token) if self.hf_token else None

    def get_embeddings(self, texts: list[str]) -> list[np.ndarray]:
        """
        Convert text to embeddings using OpenAI (preferred) or HuggingFace (fallback).
        """
        if not texts:
            return []

        # Try OpenAI first if key exists
        if self.openai_client:
            try:
                response = self.openai_client.embeddings.create(
                    input=texts,
                    model="text-embedding-3-small"
                )
                return [np.array(data.embedding) for data in response.data]
            except Exception as e:
                print(f"OpenAI Embedding Error: {e}. Falling back to HuggingFace...")

        # Fallback to HuggingFace
        if self.hf_client:
            try:
                embeddings = self.hf_client.feature_extraction(texts)
                return [np.array(v) for v in embeddings]
            except Exception as e:
                print(f"HuggingFace Embedding Error: {e}")
                raise RuntimeError("All embedding providers failed.")
        
        raise RuntimeError("No embedding provider available (check API keys).")

    def compute_similarity(self, query_vec: np.ndarray, doc_vecs: list[np.ndarray]) -> list[float]:
        """
        Compute cosine similarity. Used as a 'signal' for the scoring engine.
        """
        if not doc_vecs:
            return []
        
        q = query_vec.reshape(1, -1)
        d = np.vstack(doc_vecs)
        
        similarities = cosine_similarity(q, d)
        return similarities[0].tolist()

# Singleton instance
embedding_service = EmbeddingService()
