import { useState } from "react";
import { Button, Text, InputField, ModalTitle, Modal as UIModal } from "@taraxa_project/taraxa-ui";
import CloseIcon from '../../assets/icons/close';



type ModalProps = {
    title: string,
    onClose: () => void,
    content?: JSX.Element,
}

const Modal = ({ title, onClose, content }: ModalProps) => {
    const [isOpen, setIsOpen] = useState(true);
    content = (<>
        <ModalTitle title={title} />
        {content}
    </>)

    function closeModal() {
        setIsOpen(false);
        onClose();
    }

    return (
        <UIModal
            children={content!}
            show={isOpen}
            parentElementID='root'
            closeIcon={CloseIcon}
            title={title}
            onRequestClose={closeModal}
            styles={{
                content: {
                    width: '450px',
                    padding: '32px',
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: "#282C3E",
                    overflow: 'auto',
                    outline: 'none',
                    maxHeight: `410px`,
                    border: '1px solid #4F5368',
                    boxShadow: '0px 0px 12px rgba(0, 0, 0, 0.25)',
                    borderRadius: '6px',
                  },
                  overlay: {
                    background: "rgba(0, 0, 0, 0.5)",
                    zIndex: 2000,
                  }
            }}
        />
    )
}

export default Modal;