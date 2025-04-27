'use client';

import type { Message as TMessage } from 'ai';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useCallback, useEffect, useState } from 'react';
import equal from 'fast-deep-equal';

import { Markdown } from './markdown';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  PocketKnife,
  SparklesIcon,
  StopCircle,
} from 'lucide-react';
import { SpinnerIcon } from './icons';

interface ReasoningPart {
  type: 'reasoning';
  reasoning: string;
  details: Array<{ type: 'text'; text: string }>;
}

interface ReasoningMessagePartProps {
  part: ReasoningPart;
  isReasoning: boolean;
}

export function ReasoningMessagePart({
  part,
  isReasoning,
}: ReasoningMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: 0,
    },
  };

  const memoizedSetIsExpanded = useCallback((value: boolean) => {
    setIsExpanded(value);
  }, []);

  useEffect(() => {
    memoizedSetIsExpanded(isReasoning);
  }, [isReasoning, memoizedSetIsExpanded]);

  return (
    <div className='flex flex-col'>
      {isReasoning ? (
        <div className='flex flex-row gap-2 items-center'>
          <div className='font-medium text-sm text-[#ececf1]'>Reasoning</div>
          <div className='animate-spin'>
            <SpinnerIcon />
          </div>
        </div>
      ) : (
        <div className='flex flex-row gap-2 items-center'>
          <div className='font-medium text-sm text-[#ececf1]'>
            Reasoned for a few seconds
          </div>
          <button
            className={cn('cursor-pointer rounded-full hover:bg-[#40414f]', {
              'bg-[#40414f]': isExpanded,
            })}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDownIcon className='h-4 w-4 text-[#ececf1]' />
            ) : (
              <ChevronUpIcon className='h-4 w-4 text-[#ececf1]' />
            )}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key='reasoning'
            className='text-sm text-[#acacbe] flex flex-col gap-4 border-l pl-3 border-[#444654]'
            initial='collapsed'
            animate='expanded'
            exit='collapsed'
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {part.details.map((detail, detailIndex) =>
              detail.type === 'text' ? (
                <Markdown key={detailIndex}>{detail.text}</Markdown>
              ) : (
                '<redacted>'
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PurePreviewMessage = ({
  message,
  isLatestMessage,
  status,
}: {
  message: TMessage;
  isLoading: boolean;
  status: 'error' | 'submitted' | 'streaming' | 'ready';
  isLatestMessage: boolean;
}) => {
  return (
    <AnimatePresence key={message.id}>
      <motion.div
        className={cn(
          'w-full px-4 group/message',
          message.role === 'user' ? 'bg-[#212121]' : 'bg-[#212121]'
        )}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={`message-${message.id}`}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full max-w-2xl mx-auto py-6',
            message.role === 'user' ? 'justify-end' : ''
          )}
        >
          {message.role === 'assistant' && (
            <div className='size-8 flex items-center rounded-sm justify-center shrink-0 bg-[#10a37f]'>
              <SparklesIcon size={14} className='text-white' />
            </div>
          )}

          <div
            className={cn(
              'flex flex-col space-y-4 text-[#ececf1]',
              message.role === 'user' ? 'max-w-[75%]' : 'w-full'
            )}
          >
            {message.parts?.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={`message-${message.id}-part-${i}`}
                      className='flex flex-row gap-2 items-start w-full'
                    >
                      <div
                        className={cn(
                          'flex flex-col gap-4',
                          message.role === 'user'
                            ? 'bg-[#2e2e2e] p-3 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none'
                            : ''
                        )}
                      >
                        <Markdown>{part.text}</Markdown>
                      </div>
                    </motion.div>
                  );
                case 'tool-invocation':
                  const { toolName, state } = part.toolInvocation;

                  return (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={`message-${message.id}-part-${i}`}
                      className='flex flex-col gap-2 p-2 mb-3 text-sm bg-[#2d2e39] rounded-md border border-[#565869]'
                    >
                      <div className='flex-1 flex items-center justify-center'>
                        <div className='flex items-center justify-center w-8 h-8 bg-[#212121] rounded-full'>
                          <PocketKnife className='h-4 w-4 text-[#ececf1]' />
                        </div>
                        <div className='flex-1 ml-2'>
                          <div className='font-medium flex items-baseline gap-2 text-[#ececf1]'>
                            {state === 'call' ? 'Calling' : 'Called'}{' '}
                            <span className='font-mono bg-[#1e1e1e] px-2 py-1 rounded-md'>
                              {toolName}
                            </span>
                          </div>
                        </div>
                        <div className='w-5 h-5 flex items-center justify-center'>
                          {state === 'call' ? (
                            isLatestMessage && status !== 'ready' ? (
                              <Loader2 className='animate-spin h-4 w-4 text-[#acacbe]' />
                            ) : (
                              <StopCircle className='h-4 w-4 text-red-500' />
                            )
                          ) : state === 'result' ? (
                            <CheckCircle size={14} className='text-[#10a37f]' />
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                case 'reasoning':
                  return (
                    <ReasoningMessagePart
                      key={`message-${message.id}-${i}`}
                      // @ts-expect-error part
                      part={part}
                      isReasoning={
                        (message.parts &&
                          status === 'streaming' &&
                          i === message.parts.length - 1) ??
                        false
                      }
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const Message = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.message.annotations !== nextProps.message.annotations)
    return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

  return true;
});
