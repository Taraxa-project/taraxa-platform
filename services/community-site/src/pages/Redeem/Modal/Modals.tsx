import React from "react";
import { Modal } from "@taraxa_project/taraxa-ui";
import { ethers } from "ethers";
import { formatEth, roundEth, weiToEth } from "../../../utils/eth";
import CloseIcon from "../../../assets/icons/close";
import RedeemWarning from "./RedeemWarning";

export interface RedeemModalsProps {
  warningModal: boolean;
  onWarningModalClose: () => void;
  onWarningModalAccept: () => void;
  taraAmount: ethers.BigNumber;
}

const RedeemModals = (props: RedeemModalsProps) => {
  const {
    warningModal,
    onWarningModalClose,
    onWarningModalAccept,
    taraAmount,
  } = props;
  return (
    <>
      {warningModal && (
        <Modal
          id="warningModal"
          title={`You are redeeming ${taraAmount} TARA`}
          show={warningModal}
          children={
            <RedeemWarning
              amount={formatEth(roundEth(weiToEth(taraAmount)))}
              onDenial={onWarningModalClose}
              onAccept={onWarningModalAccept}
            />
          }
          parentElementID="root"
          onRequestClose={() => onWarningModalClose()}
          closeIcon={CloseIcon}
        />
      )}
    </>
  );
};

export default RedeemModals;
