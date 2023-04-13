import React from 'react';
// import { formatValidatorName } from '../../utils/string';
import './nickname.scss';

interface NickNameProps {
  address: string;
  description?: string;
}

const NickName = ({ address, description }: NickNameProps) => {
  return (
    <div className="nicknameContainer">
      <div>{description}</div>
      <div className="address">{address}</div>
    </div>
  );
};
export default NickName;
