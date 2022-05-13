import React from 'react';

const ModalText = (props: {
  text: string;
  bold?: boolean;
  marginTop: string;
  marginBottom: string;
  color?: string;
  background?: string;
  borderRadius?: string;
}) => {
  const { text, bold, marginBottom, marginTop, color, background, borderRadius } = props;
  return (
    <span
      style={{
        marginTop,
        marginBottom,
        fontSize: bold ? 'bold' : 'normal',
        color: color || 'currentColor',
        background: background || 'transparent',
        borderRadius: borderRadius || '0px',
      }}
    >
      {text}
    </span>
  );
};
export default ModalText;
