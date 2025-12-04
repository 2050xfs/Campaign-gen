import React from 'react';

export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118v-.09A18.324 18.324 0 012.25 12c0-3.767 1.02-7.318 2.802-10.165V1.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121.75 1.25v12.25c0 2.44-1.62 4.548-4 5.162-2.498.654-5.282.424-7.22-.644z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75h6"
    />
  </svg>
);