import { modelID } from '@/ai/providers';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';
import { ModelPicker } from './model-picker';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export type QueryType = 'rag' | 'semantic' | 'keyword';

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
  queryType: QueryType;
  setQueryType: (type: QueryType) => void;
}

export const Textarea = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
  selectedModel,
  setSelectedModel,
  queryType,
  setQueryType,
}: InputProps) => {
  return (
    <div className='relative w-full pt-4'>
      <ShadcnTextarea
        className='resize-none bg-[#303030] text-white border-0 w-full rounded-xl pr-12 pt-4 pb-16 focus-visible:ring-[#10a37f] focus-visible:ring-1 focus-visible:ring-offset-0'
        value={input}
        autoFocus
        placeholder={'Ask anything'}
        // @ts-expect-error err
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              // @ts-expect-error err
              const form = e.target.closest('form');
              if (form) form.requestSubmit();
            }
          }
        }}
      />
      <div className='absolute bottom-3 left-3 flex flex-row items-center gap-2'>
        <ModelPicker
          setSelectedModel={setSelectedModel}
          selectedModel={selectedModel}
          simplified={true}
        />

        <Select
          value={queryType}
          onValueChange={(value: QueryType) => setQueryType(value)}
        >
          <SelectTrigger className='bg-transparent border-0 text-[#a5a5a5] text-xs hover:bg-[#2a2b32] focus:ring-0 h-8 py-1'>
            <SelectValue placeholder='Search'>
              {queryType === 'rag'
                ? 'RAG'
                : queryType === 'semantic'
                ? 'Semantic'
                : 'Keyword'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className='bg-[#2a2b32] border-[#444654] text-[#ececf1]'>
            <SelectGroup>
              <SelectItem
                value='rag'
                className='text-[#ececf1] focus:bg-[#40414f] focus:text-white'
              >
                RAG
              </SelectItem>
              <SelectItem
                value='semantic'
                className='text-[#ececf1] focus:bg-[#40414f] focus:text-white'
              >
                Semantic
              </SelectItem>
              <SelectItem
                value='keyword'
                className='text-[#ececf1] focus:bg-[#40414f] focus:text-white'
              >
                Keyword
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {status === 'streaming' || status === 'submitted' ? (
        <button
          type='button'
          onClick={stop}
          className='cursor-pointer absolute right-3 bottom-3 rounded-md p-2 bg-[#10a37f] hover:bg-[#0d8a6c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <div className='animate-spin h-5 w-5'>
            <svg className='h-5 w-5 text-white' viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
                fill='none'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          </div>
        </button>
      ) : (
        <button
          type='submit'
          disabled={isLoading || !input.trim()}
          className='absolute right-3 bottom-3 rounded-full p-2 bg-white hover:bg-gray-100 disabled:bg-[#303030] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <ArrowUp className='h-5 w-5 text-black stroke-[3]' />
        </button>
      )}
    </div>
  );
};
