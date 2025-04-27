import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header = ({ onReset }: HeaderProps) => {
  return (
    <div className='fixed right-0 left-0 w-full top-0 bg-[#212121] border-b border-[#2e2e2e]'>
      <div className='flex justify-between items-center p-4 max-w-3xl mx-auto'>
        <h1 className='text-lg font-medium text-white'>AI Assistant</h1>

        {onReset && (
          <button
            onClick={onReset}
            className='flex items-center gap-1 px-2 py-1 text-xs text-[#a5a5a5] hover:text-white bg-[#2e2e2e] hover:bg-[#3a3a3a] rounded-md transition-colors'
          >
            <RefreshCw size={12} />
            <span>New Chat</span>
          </button>
        )}
      </div>
    </div>
  );
};
