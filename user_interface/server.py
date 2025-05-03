from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import uuid
from typing import Dict, List, Any

#import the keyword search class
from keyword_search import KeywordSearch

app = Flask(__name__)
# Enable CORS for your Next.js application
CORS(app)

# In-memory conversation store (use a database in production)
conversation_store: Dict[str, List[Dict[str, Any]]] = {}

@app.route('/chat', methods=['POST'])
def chat():
    try:
        # Parse the incoming request data
        data = request.json
        
        # Extract parameters
        messages = data.get('messages', [])
        model = data.get('model', 'llama-3.1-8b-instant')  # Default model
        query_type = data.get('queryType', 'rag')  # Default query type
        session_id = data.get('sessionId')

        # Generate a session ID if none provided
        if not session_id:
            session_id = f"session_{uuid.uuid4()}"
        
        # Store or update conversation context
        conversation_store[session_id] = messages
        
        # Get the last user message
        user_message = "No message found"
        for msg in reversed(messages):
            if msg.get('role') == 'user':
                user_message = msg.get('content', "No message found")
                break
        
        # Generate response based on query type
        if query_type == 'rag':
            intro = f"Using RAG to answer: '{user_message}'\n\n"
            
            # Check conversation history length to provide context-aware responses
            context_message = ""
            if len(messages) > 2:
                context_message = "I see we've been discussing this topic. Based on our conversation, "
            
            response_text = context_message + "Here's some information I found in our knowledge base: The RAG (Retrieval Augmented Generation) approach combines the power of large language models with external knowledge retrieval. This allows for more accurate, up-to-date, and verifiable responses. Your question has been processed using this approach to give you the most relevant information possible."
            # todo: add RAG logic here

        elif query_type == 'semantic':
            intro = f"Using Semantic Search to find: '{user_message}'\n\n"
            response_text = "Semantic search looks at the meaning behind your query rather than just keywords. I've analyzed your question conceptually and found these results based on semantic similarity to your query. This often catches nuances and related concepts that keyword search might miss."
            # todo: add semantic search logic here

        else:  # keyword search
            intro = f"Using Keyword Search for: '{user_message}'\n\n"
            # response_text = "Keyword search focuses on finding exact matches to the terms in your query. I've identified the key terms in your question and found content that contains these specific keywords. This approach is direct and finds precise matches to what you're asking about."
            searcher = KeywordSearch()
            results = searcher.search(user_message)[0]
            print(f"\nResult:")
            response_text = f"Source: {results[1]}\n\nResults from keyword search: {results[0]}."

        
        # Add artificial delay to simulate processing time (optional)
        time.sleep(0.5)
        
        # Return the complete response as a single JSON object
        return jsonify({
            'text': intro + response_text
        })
        
    except Exception as e:
        # Log the error (replace with proper logging in production)
        print(f"Error processing request: {str(e)}")
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == "__main__":
    # In production, use a proper WSGI server like gunicorn
    app.run(host='0.0.0.0', port=5000, debug=True)
    # searcher = KeywordSearch()
    # results = searcher.search("What should I put in my technical diary?")[0]
    # # Print results (just for troubleshooting)
    # print(f"\nResult:")
  