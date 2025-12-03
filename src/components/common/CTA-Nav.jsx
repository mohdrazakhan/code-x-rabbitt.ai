import React from 'react';

const ButtonHoverMultiple = () => {
  return (
    <button className='group relative cursor-pointer'>
      <div
        className='relative z-10 inline-flex h-12 items-center justify-center overflow-hidden rounded-full
        bg-gradient-to-r from-zinc-800 to-zinc-700 border-2 border-zinc-600 
        px-6 font-medium text-white transition-all duration-300 
        group-hover:-translate-x-2 group-hover:-translate-y-2'
      >
        CodeX
      </div>
      <div className='absolute inset-0 z-0 h-full w-full rounded-full transition-all duration-300 
      group-hover:-translate-x-2 group-hover:-translate-y-2
      group-hover:[box-shadow:4px_4px_#52525b,8px_8px_#71717a]'></div>
    </button>
  );
};

export default ButtonHoverMultiple;
