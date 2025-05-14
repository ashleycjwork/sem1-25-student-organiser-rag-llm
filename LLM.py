from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from langchain_ollama import OllamaLLM

from langchain_core.runnables import RunnableParallel
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

# Load the same embedding model used during creation
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Load the persisted Chroma vector store
vector_store = Chroma(
    persist_directory="./chroma_db",     # Same directory used when saving
    embedding_function=embedding_model   # Embedding function must match
)


# LLM Model
llm = OllamaLLM(model="hf.co/llmware/bling-phi-3-gguf", temperature=0.2)

# Template for LLM
template = """{context}
        
        Question: {question}
        
        Please provide a clear and concise answer based only on the information provided above. 
        If the information is not sufficient to answer the question, please say so."""

prompt = PromptTemplate.from_template(template)


# Define a chain to return both the answer and the sources
qa_chain_with_sources = (
    RunnableParallel(
        {
            "context": vector_store.as_retriever(),
            "question": RunnablePassthrough(),
        }
    )
    | {
        "answer": prompt | llm | StrOutputParser(),
        "sources": lambda x: [doc.metadata.get("source", "Unknown") for doc in x["context"]],
    }
)

# Function to call a RAG LLM query
def rag_query(query):
   
    # Invoke the chain
    response = qa_chain_with_sources.invoke(query)
    
    answer = response["answer"]
    unique_sources = list(set(response["sources"]))

    # Print answers + sources
    output = f"Answer: {answer}\n\nSources:\n" + "\n".join(unique_sources)
    return output

print(rag_query("What should I put in my technical diary?"))