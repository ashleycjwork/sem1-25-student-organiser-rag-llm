'use client';

import { defaultModel, modelID } from '@/ai/providers';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { Textarea, QueryType } from './textarea';
import { ProjectOverview } from './project-overview';
import { Messages } from './messages';
import { toast } from 'sonner';

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const [queryType, setQueryType] = useState<QueryType>('rag');
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize or retrieve session ID from localStorage on component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    status,
    stop,
    isLoading,
  } = useChat({
    api: '/api/chat',
    body: {
      selectedModel,
      queryType,
      sessionId,
    },
    streamProtocol: 'text',
    onResponse: (response) => {
      // Extract session ID from response headers and store it
      const responseSessionId = response.headers.get('X-Session-ID');
      if (responseSessionId && responseSessionId !== sessionId) {
        setSessionId(responseSessionId);
        localStorage.setItem('chatSessionId', responseSessionId);
      }
    },
    onError: (error) => {
      toast.error(
        error.message.length > 0
          ? error.message
          : 'An error occurred, please try again later.',
        { position: 'top-center', richColors: true }
      );
    },
  });

  // Custom handleSubmit to ensure sessionId is included
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    originalHandleSubmit(e);
  };

  return (
    <div className='h-dvh flex flex-col justify-center w-full stretch bg-[#212121]'>
      {messages.length === 0 ? (
        <div className='max-w-xl mx-auto w-full'>
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}
      <form
        onSubmit={handleSubmit}
        className='pb-8 bg-[#212121] w-full max-w-xl mx-auto px-4 sm:px-0'
      >
        <Textarea
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          queryType={queryType}
          setQueryType={setQueryType}
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          status={status}
          stop={stop}
        />
      </form>
    </div>
  );
}
