import { modelID } from '@/ai/providers';
import { QueryType } from '@/components/textarea';
import { Message } from 'ai';

// Allow longer responses for up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const {
      messages,
      selectedModel,
      queryType,
    }: {
      messages: Message[];
      selectedModel: modelID;
      queryType: QueryType;
    } = await req.json();

    // Send request to backend
    const response = await fetch(
      process.env.BACKEND_API_URL || 'http://localhost:5000/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: selectedModel,
          queryType,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    // Get the response data
    const data = await response.json();

    // Return the response as a stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(data.text));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('Error in chat API:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
