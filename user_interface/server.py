from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import uuid
from typing import Dict, List, Any
from datetime import datetime
import traceback

#import the keyword search class
from keyword_search import KeywordSearch
#import the semantic search class
from semantic_search import SemanticSearch
#import the llm bling phi 3 class
from llm_bling_phi_3 import LLMBlingPhi3
#import the llm tinyllama class
from llm_tinyllama import LLMTinyLlama

app = Flask(__name__)
# Enable CORS for your Next.js application
CORS(app)

# In-memory conversation store (use a database in production)
conversation_store: Dict[str, List[Dict[str, Any]]] = {}

# Function to log messages to a text file
def log_message(user_message: str, response_text: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"Timestamp: {timestamp}\nUser Message: {user_message}\nResponse: {response_text}\n--------------------------------\n"


    with open("chat_log.txt", "a") as log_file:
        log_file.write(log_entry)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        # Parse the incoming request data
        data = request.json
        
        # Extract parameters
        messages = data.get('messages', [])
        model = data.get('model', 'bling-phi-3-gguf')  # Default model
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
            intro = f"Using RAG to answer: '{user_message}'\n\n Model: {model}\n\n"
            
            if model == 'bling-phi-3-gguf':
                try:
                    searcher = LLMBlingPhi3()
                    response_text = searcher.search(user_message)
                except Exception as e:
                    print("Error in bling-phi-3 search:", traceback.format_exc())
                    response_text = "No results found" + traceback.format_exc()
                # response_text =  "Here's some information I found in our knowledge base: The RAG (Retrieval Augmented Generation) approach combines the power of large language models with external knowledge retrieval. This allows for more accurate, up-to-date, and verifiable responses. Your question has been processed using this approach to give you the most relevant information possible."
            else:
                #todo: add other model logic here
                try: 
                    searcher = LLMTinyLlama()
                    response_text = searcher.search(user_message)
                except Exception as e:
                    print("Error in tinyllama search:", traceback.format_exc())
                    response_text = "No results found" + traceback.format_exc()
                # response_text =  "Here's some information I found in our knowledge base: The RAG (Retrieval Augmented Generation) approach combines the power of large language models with external knowledge retrieval. This allows for more accurate, up-to-date, and verifiable responses. Your question has been processed using this approach to give you the most relevant information possible."
        elif query_type == 'semantic':
            try:
                intro = f"Using Semantic Search to find: '{user_message}'\n\n"
                # response_text = "Semantic search looks at the meaning behind your query rather than just keywords. I've analyzed your question conceptually and found these results based on semantic similarity to your query. This often catches nuances and related concepts that keyword search might miss."
                searcher = SemanticSearch()
                results = searcher.search(user_message)[0]
                print(f"\nResult:")
                response_text = f"Source: {results[1]}\n\nResults from semantic search: {results[0]}."
            except Exception as e:
                print("Error in semantic search:", traceback.format_exc())
                response_text = "No results found"
        else:  # keyword search
            intro = f"Using Keyword Search for: '{user_message}'\n\n"
            # response_text = "Keyword search focuses on finding exact matches to the terms in your query. I've identified the key terms in your question and found content that contains these specific keywords. This approach is direct and finds precise matches to what you're asking about."
            searcher = KeywordSearch()
            results = searcher.search(user_message)[0]
            print(f"\nResult:")
            response_text = f"Source: {results[1]}\n\nResults from keyword search: {results[0]}."

        #log the interaction to a file 
        log_message(user_message, response_text)

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
    searcher = LLMBlingPhi3()
    print(searcher.search("What should I put in my technical diary?"))
  