export const ProjectOverview = () => {
  return (
    <div className='flex flex-col items-center justify-end mt-10 text-white'>
      <div className='p-4 mb-4 rounded-full bg-[#10a37f] w-12 h-12 flex items-center justify-center'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
        </svg>
      </div>
      <h1 className='text-3xl font-semibold mb-4 text-white'>
        How can I help you today?
      </h1>
      <p className='text-center text-[#ececf1]'>
        I&apos;m an AI assistant designed to help answer your questions and
        provide information.
      </p>
    </div>
  );
};
