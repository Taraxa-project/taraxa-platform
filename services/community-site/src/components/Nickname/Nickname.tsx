import React from 'react';
import { ProfileIcon } from '@taraxa_project/taraxa-ui';
import './nickname.scss';

interface NickNameProps {
  address: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const Nickname = ({ address, description, size = 'medium', showIcon = false }: NickNameProps) => {
  const iconSize = () => {
    switch (size) {
      case 'large':
        return 40;
      case 'medium':
        return 30;
      case 'small':
        return 20;
      default:
        return 30;
    }
  };
  return (
    <div className="nicknameWrapper">
      {showIcon && <ProfileIcon title={address} size={iconSize()} />}
      <div className="nicknameContainer">
        <div className={`nicknameText-${size}`}>{address}</div>
        {description && <div className={`nicknameText-${size}`}>{description}</div>}
      </div>
    </div>
  );
};
export default Nickname;
