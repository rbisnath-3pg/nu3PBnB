import React from 'react';

const Spinner = ({ text = '', size = 48, className = '' }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <svg
      className="animate-spin text-blue-600"
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 0 0-15-15V5z"
      />
    </svg>
    {text && <div className="mt-2 text-blue-700 font-medium text-lg animate-pulse">{text}</div>}
  </div>
);

export default Spinner; 