import * as React from 'react';

const Clipboard = () => (
  <svg width={16} height={16} fill='none' xmlns='http://www.w3.org/2000/svg'>
    <g clipPath='url(#a)'>
      <path
        d='M10.667.667h-8c-.733 0-1.333.6-1.333 1.333v9.333h1.333V2h8V.667Zm2 2.666H5.334c-.733 0-1.333.6-1.333 1.334V14c0 .733.6 1.333 1.333 1.333h7.333c.734 0 1.334-.6 1.334-1.333V4.667c0-.734-.6-1.334-1.334-1.334Zm0 10.667H5.334V4.667h7.333V14Z'
        fill='#fff'
      />
    </g>
    <defs>
      <clipPath id='a'>
        <path fill='#fff' d='M0 0h16v16H0z' />
      </clipPath>
    </defs>
  </svg>
);

export default Clipboard;
