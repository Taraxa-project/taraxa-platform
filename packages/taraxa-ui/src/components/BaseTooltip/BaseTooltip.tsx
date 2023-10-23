import React, { ReactNode } from 'react';
import './BaseTooltip.css';

interface BaseTooltipProps {
  text: string;
  children: ReactNode;
}

export const BaseTooltip: React.FC<BaseTooltipProps> = ({ text, children }) => {
  return (
    <div className='has-tooltip'>
      {children}
      <span className='tooltip-wrapper'>
        <span className='tooltip'>{text}</span>
      </span>
    </div>
  );
};
