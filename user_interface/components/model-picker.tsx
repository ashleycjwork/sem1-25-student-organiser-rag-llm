'use client';
import { modelID, MODELS } from '@/ai/providers';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ModelPickerProps {
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
  simplified?: boolean;
}

// Map for simplified model names
const simplifiedNames: Record<string, string> = {
  'meta-llama/llama-4-scout-17b-16e-instruct': 'Llama 4',
  'llama-3.1-8b-instant': 'Llama 3.1',
  'deepseek-r1-distill-llama-70b': 'DeepSeek',
  'llama-3.3-70b-versatile': 'Llama 3.3',
};

export const ModelPicker = ({
  selectedModel,
  setSelectedModel,
  simplified = false,
}: ModelPickerProps) => {
  const getDisplayName = (modelId: string) => {
    return simplified && simplifiedNames[modelId]
      ? simplifiedNames[modelId]
      : modelId;
  };

  return (
    <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger className='bg-transparent border-0 text-[#a5a5a5] text-xs hover:bg-[#2a2b32] focus:ring-0 h-8 py-1'>
        <SelectValue placeholder='Model'>
          {getDisplayName(selectedModel)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className='bg-[#2a2b32] border-[#444654] text-[#ececf1]'>
        <SelectGroup>
          {MODELS.map((modelId) => (
            <SelectItem
              key={modelId}
              value={modelId}
              className='text-[#ececf1] focus:bg-[#40414f] focus:text-white'
            >
              {getDisplayName(modelId)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
