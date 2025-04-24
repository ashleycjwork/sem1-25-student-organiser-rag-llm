import { model, modelID } from "@/ai/providers";
import { getRelevantContext } from "@/ai/tools/context";
import { streamText, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    selectedModel,
  }: { messages: UIMessage[]; selectedModel: modelID } = await req.json();

  // Get the latest user message
  const latestMessage = messages[messages.length - 1];
  
  // Fetch relevant context if it's a user message
  let context = '';
  if (latestMessage.role === 'user') {
    context = await getRelevantContext(latestMessage.content);
    console.log('Retrieved context:', context);
  }

  const result = streamText({
    model: model.languageModel(selectedModel),
    system: `You are a helpful assistant with access to a knowledge base about herbology and potions.
    
When answering questions, ONLY use information from the following context:

${context}

IMPORTANT: 
1. Do not attempt to use any external search tools.
2. Do not execute any code or use any programming languages.
3. ONLY use information from the provided context above.
4. If the context does not contain the information needed to answer the question, say "I don't have that information in my knowledge base" instead of making things up.
5. Never make up or invent information that is not in the context.`,
    messages,
    experimental_telemetry: {
      isEnabled: true,
    },
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: (error) => {
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          return "Rate limit exceeded. Please try again later.";
        }
      }
      console.error(error);
      return "An error occurred.";
    },
  });
}
