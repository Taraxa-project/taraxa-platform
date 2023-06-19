import React, { useEffect, useState } from 'react';
import RModal from 'react-modal';
import Button from '../Button';
import '../app.scss';

export interface ModalProps {
  title: string;
  children: JSX.Element;
  show: boolean;
  parentElementID: string;
  onRequestClose: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  id?: string;
  closeIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

const Modal = ({
  children,
  show,
  title,
  parentElementID,
  onRequestClose,
  id,
  closeIcon,
}: ModalProps) => {
  const { height } = useWindowDimensions();

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#282C3E',
      overflow: 'auto',
      outline: 'none',
      maxHeight: `${height - 100}px`,
      border: '1px solid #4F5368',
      boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.25)',
      borderRadius: '6px',
    },
    overlay: {
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 2000,
    },
  };

  RModal.setAppElement(`#${parentElementID}`);

  return (
    <RModal
      onRequestClose={onRequestClose}
      isOpen={show}
      style={customStyles}
      contentLabel={title}
      id={id}
    >
      <Button
        Icon={closeIcon}
        onClick={onRequestClose}
        className='modalClose'
      />
      {children}
    </RModal>
  );
};

export default Modal;
