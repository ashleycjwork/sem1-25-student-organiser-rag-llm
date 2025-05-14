import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

class SemanticSearch:
    def __init__(self, db_path="./chroma_db", model_name="all-MiniLM-L6-v2"):
        #initialize embedding model
        self.embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        #load the persisted vector store - ChromaDB
        self.vector_store = Chroma(
            persist_directory=db_path,    
            embedding_function=self.embedding_model   
        )

    def search(self, query, k=1, snippet_length=2048):
        # Perform semantic search
        results = self.vector_store.similarity_search(query, k=k)

        #prepare content and sources
        final_results = []
        for doc in results:
            content = doc.page_content
            source = doc.metadata.get("source", "Unknown")

            #extract snippet from start or near a keyword
            query_words = query.lower().split()
            content_lower = content.lower()

            match_index = -1
            for word in query_words:
                match_index = content_lower.find(word)
                if match_index != -1:
                    break

            if match_index == -1:
                snippet = content[:snippet_length]
            else:
                start = max(0, match_index - snippet_length // 2)
                end = min(len(content), start + snippet_length)
                snippet = content[start:end].strip()
            
            final_results.append((snippet, source))
        return final_results


searcher = SemanticSearch() # Create an instance of the SemanticSearch class
results = searcher.search("What should I put in my technical diary?") # Perform a search with the query
for idx, (snippet, source) in enumerate(results, 1):
    print(f"\nResult {idx}:")
    print(f"Source: {source}")
    print("Snippet:")
    print(snippet)
    print("-" * 50)