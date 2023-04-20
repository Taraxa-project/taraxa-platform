import React from 'react';
// import { formatValidatorName } from '../../utils/string';
import './nickname.scss';

interface NickNameProps {
  address: string;
  description?: string;
}

const Nickname = ({ address, description }: NickNameProps) => {
  return (
    <div className="nickname-container">
      <div className="address">{address}</div>
      {description && <div>{description}</div>}
    </div>
  );
};
export default Nickname;
