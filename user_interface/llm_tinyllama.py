from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain_core.runnables import RunnableMap, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

class LLMTinyLlama:
    def __init__(self):
       
        # Load the same embedding model used during creation
        embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        # Load the persisted Chroma vector store
        self.vector_store = Chroma(
            persist_directory="./chroma_db",     # Same directory used when saving
            embedding_function=embedding_model   # Embedding function must match
        )

        # LLM Model
        self.llm = OllamaLLM(model="tinyllama", temperature=0.2)

        # Template for LLM
        template = """{context}\n\nQuestion: {question}\n\nPlease provide a clear and concise answer based only on the information provided above. \n        If the information is not sufficient to answer the question, please say so."""

        self.prompt = PromptTemplate.from_template(template)

        def format_docs(docs):
            # Format the documents for display
            return "\n\n".join(doc.page_content for doc in docs)
        
        #custom retriever function that filers by score
        def retrieve_and_filter_with_top_sources(question, k=5, threshold=0.6):
            results = self.vector_store.similarity_search_with_score(question, k=k)
            top_sources = [doc.metadata.get("source", "Unknown") for doc, _ in results[:3]]
            filtered_docs = [doc for doc, score in results if score <= threshold]
            print(f"\n🔍 Top 3 Sources for: \"{question}\"")
            for i, (doc, score) in enumerate(results[:3]):
                print(f"{i+1}. Score: {score:.4f} | Source: {doc.metadata.get('source', 'Unknown')}")
            return filtered_docs, top_sources
        
        # Define a chain to return both the answer and the sources
        self.qa_chain_with_sources = (
            RunnableMap(
                {
                    "docs_and_sources": lambda question: retrieve_and_filter_with_top_sources(question),
                    "question": RunnablePassthrough(),
                }
            )
            | {
                "answer": {
                    "context": lambda x: format_docs(x["docs_and_sources"][0]),
                    "question": lambda x: x["question"],
                } | self.prompt | self.llm | StrOutputParser(),

                "sources": lambda x: x["docs_and_sources"][1]  # always return top 3 links
            }
        )

    def search(self, query):
        # Invoke the chain
        response = self.qa_chain_with_sources.invoke(query)
        answer = response["answer"]
        sources = response["sources"]

         # Output with sources if available
        if sources:
            output = f"Answer:\n{answer}\n\nPotential Sources:\n" + "\n".join(sources)
        else:
            output = f"Answer:\n{answer}\n\n(No relevant sources)"
        return output

# Example usage:
llmrag = LLMTinyLlama()
print(llmrag.search("What is Stage 1 of development"))