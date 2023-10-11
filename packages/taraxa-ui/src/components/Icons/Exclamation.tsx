import React from 'react';

const Exclamation = ({ color }: { color: string }) => {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M8.99888 0.0722656C4.07031 0.0722656 0.0703125 4.07227 0.0703125 9.00084C0.0703125 13.9294 4.07031 17.9294 8.99888 17.9294C13.9275 17.9294 17.9275 13.9294 17.9275 9.00084C17.9275 4.07227 13.9275 0.0722656 8.99888 0.0722656ZM9.89174 13.4651H8.10603V8.10798H9.89174V13.4651ZM9.89174 6.32227H8.10603V4.53655H9.89174V6.32227Z'
        fill={color}
      />
    </svg>
  );
};

export default Exclamation;
