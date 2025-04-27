import type { Message as TMessage } from 'ai';
import { Message } from './message';
import { useScrollToBottom } from '@/lib/hooks/use-scroll-to-bottom';

export const Messages = ({
  messages,
  isLoading,
  status,
}: {
  messages: TMessage[];
  isLoading: boolean;
  status: 'error' | 'submitted' | 'streaming' | 'ready';
}) => {
  const [containerRef, endRef] = useScrollToBottom();
  return (
    <div className='flex-1 h-full space-y-0 overflow-y-auto' ref={containerRef}>
      <div className='w-full mx-auto pt-20'>
        {messages.map((m, i) => (
          <Message
            key={i}
            isLatestMessage={i === messages.length - 1}
            isLoading={isLoading}
            message={m}
            status={status}
          />
        ))}
        <div className='h-1' ref={endRef} />
      </div>
    </div>
  );
};
