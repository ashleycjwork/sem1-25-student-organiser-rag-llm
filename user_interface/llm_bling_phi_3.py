from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

class LLMBlingPhi3:
    def __init__(self):
       
        # Load the same embedding model used during creation
        embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        # Load the persisted Chroma vector store
        vector_store = Chroma(
            persist_directory="./chroma_db",     # Same directory used when saving
            embedding_function=embedding_model   # Embedding function must match
        )

        # LLM Model
        llm = OllamaLLM(model="hf.co/llmware/bling-phi-3-gguf", temperature=0.2, base_url="http://host.docker.internal:11434")

        # Template for LLM
        template = """{context}\n\nQuestion: {question}\n\nPlease provide a clear and concise answer based only on the information provided above. \n        If the information is not sufficient to answer the question, please say so."""

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

        self.qa_chain_with_sources = qa_chain_with_sources

    def search(self, query):
        # Invoke the chain
        response = self.qa_chain_with_sources.invoke(query)
        answer = response["answer"]
        unique_sources = list(set(response["sources"]))
        # Format sources as bullet points
        if unique_sources:
            sources_formatted = "\n\n".join(f"• {src}" for src in unique_sources)
        else:
            sources_formatted = "• (No sources found)"

        # Build full output
        output = (
            f"Answer:\n{answer}\n\n"
            f"Top Sources:\n\n{sources_formatted}\n\n"
            "📌 If the answer above is not clear or complete:\n"
            "Check the potential sources listed above. If you're still unsure,\n"
            "please attend the daily standup or email Rowland at [mosbergen.r@wehi.edu.au]."
        )
        return output

# # Example usage:
# llmrag = LLMBlingPhi3()
# print(llmrag.search("What should I put in my technical diary?"))