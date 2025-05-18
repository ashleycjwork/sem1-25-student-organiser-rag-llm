from sklearn.feature_extraction.text import TfidfVectorizer 
from sklearn.metrics.pairwise import cosine_similarity 
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
import json
import os

# Class for keyword search
class KeywordSearch:
    def __init__(self):
        # Update the file path to use the correct relative path
        file_path = os.path.join(os.path.dirname(__file__), "all_data.json")

        # Open the JSON file
        with open(file_path, "r") as f:
            all_data = json.load(f)
        self.vectorizer = TfidfVectorizer() # Create TF-IDF vectoriser
        self.docs = [doc['content'] for doc in all_data]
        self.doc_sources = [doc['source'] for doc in all_data]
        self.tfidf_matrix = self.vectorizer.fit_transform(self.docs) # Transforms the content into TF-IDF matrix

    def search(self, query, top_k=1, snippet_length=2048):
        query_vector = self.vectorizer.transform([query]) # Vectorise query
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten() # Compare query vector with document vector
        top_indices = similarities.argsort()[::-1][:top_k] # Arrange similarity scores from most to least similar and take first 3 indices
        
        results = [] # Initialise results
        for i in top_indices:
            doc = self.docs[i] # Take the top i most similar documents
            source = self.doc_sources[i]

            # Preprocess by converting all to lowercase
            query_words = [
                word for word in query.lower().split()
                if word not in ENGLISH_STOP_WORDS
            ]
            doc_lower = doc.lower()

            match_index = -1 # Initialise (-1 when no match is found)
            for word in query_words:
                match_index = doc_lower.find(word) # Find the position of the word in the document
                if match_index != -1:
                    break
        
            if match_index == -1: # If no match is found
                snippet = doc[:snippet_length]  # Return the first snippet_length characters of the document
            else:
                start = max(0, match_index - snippet_length // 2) 
                end = min(len(doc), start + snippet_length)
                snippet = doc[start:end].strip()

            results.append((snippet, source))
    
        return results

searcher = KeywordSearch() # Create an instance of the KeywordSearch class
results = searcher.search("What should I put in my technical diary?")

# # Print results (just for troubleshooting)
# for idx, (snippet, source) in enumerate(results, 1):
#     print(f"\nResult {idx}:")
#     print(f"Source: {source}")
#     print("Snippet:")
#     print(snippet)
#     print("-" * 50)

