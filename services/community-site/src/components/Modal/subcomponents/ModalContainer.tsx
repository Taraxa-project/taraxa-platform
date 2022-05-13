import React from 'react';

const ModalContainer = (props: { children: React.ReactNode; wrap?: boolean }) => {
  const { children, wrap } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        textAlign: 'center',
        wordBreak: wrap ? 'break-word' : 'normal',
      }}
    >
      {children}
    </div>
  );
};

export default ModalContainer;
