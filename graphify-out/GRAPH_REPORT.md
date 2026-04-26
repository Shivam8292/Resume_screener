# Graph Report - C:\Users\shiva\Desktop\first_project  (2026-04-26)

## Corpus Check
- 30 files · ~13,099 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 88 nodes · 67 edges · 28 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `test_diagnostics()` - 4 edges
2. `EmbeddingService` - 4 edges
3. `ScoringService` - 4 edges
4. `extract_text_from_pdf()` - 4 edges
5. `ExtractionService` - 3 edges
6. `ParsingService` - 3 edges
7. `chunk_text()` - 3 edges
8. `RankRequest` - 2 edges
9. `CompareRequest` - 2 edges
10. `ImproveRequest` - 2 edges

## Surprising Connections (you probably didn't know these)
- `test_diagnostics()` --calls--> `extract_text_from_pdf()`  [INFERRED]
  C:\Users\shiva\Desktop\first_project\diagnose.py → C:\Users\shiva\Desktop\first_project\backend\utils\pdf_parser.py
- `upload_resumes()` --calls--> `chunk_text()`  [INFERRED]
  C:\Users\shiva\Desktop\first_project\backend\main.py → C:\Users\shiva\Desktop\first_project\backend\utils\chunking.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (14): BaseModel, clear_all_data(), CompareRequest, delete_resume(), get_uploaded_resumes(), improve_resume_endpoint(), ImproveRequest, rank_resumes() (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.25
Nodes (4): test_diagnostics(), EmbeddingService, Convert text to embeddings using OpenAI (preferred) or HuggingFace (fallback)., Compute cosine similarity. Used as a 'signal' for the scoring engine.

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (5): clean_resume_text(), extract_text_from_pdf(), Extract text from PDF bytes using PyMuPDF and clean it., clean_resume_text(), Cleans extracted resume text while preserving structure.     - Removes excessiv

### Community 3 - "Community 3"
Cohesion: 0.4
Nodes (2): Phase 5, 6, 7, 8, 9, 10: The Core Intelligence Engine.         Returns a compre, ScoringService

### Community 4 - "Community 4"
Cohesion: 0.4
Nodes (2): ExtractionService, Phase 4: Extract structured skills, projects, experience, and domains.

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (4): analyze_resume(), compare_candidates(), Analyze a resume against a job description using Groq LLM., Generate a qualitative comparison between two candidates using Groq.

### Community 6 - "Community 6"
Cohesion: 0.4
Nodes (2): ParsingService, Phase 3: Convert JD into structured categories.

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (3): chunk_text(), Split text into chunks of words with overlap., upload_resumes()

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **15 isolated node(s):** `Returns the list of filenames currently in the persistent cloud database.`, `Refined /rank endpoint (Phase 11-13).     Implements weighted scoring, evidence`, `Endpoint for Phase 12: ATS Optimizer.     Suggests improvements based on struct`, `Deletes a specific resume and its chunks using a query parameter for robustness.`, `Clears all resumes and chunks from the system.` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 8`** (2 nodes): `create_test_pdf.py`, `create_pdf()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `create_test_pdf_2.py`, `create_resume_2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (2 nodes): `debug_supabase.py`, `test_supabase_direct()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `test_backend_upload.py`, `test_upload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `ComparisonView.jsx`, `ComparisonView()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `JDInput.jsx`, `JDInput()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `ResultCard.jsx`, `ResultCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `TopNav.jsx`, `TopNav()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `UploadSection.jsx`, `UploadSection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `check_gh.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `check_gh_diff.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `smoke_test.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `test_hf.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `test_diagnostics()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `extract_text_from_pdf()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `upload_resumes()` connect `Community 7` to `Community 0`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `test_diagnostics()` (e.g. with `extract_text_from_pdf()` and `.get_embeddings()`) actually correct?**
  _`test_diagnostics()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Returns the list of filenames currently in the persistent cloud database.`, `Refined /rank endpoint (Phase 11-13).     Implements weighted scoring, evidence`, `Endpoint for Phase 12: ATS Optimizer.     Suggests improvements based on struct` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._