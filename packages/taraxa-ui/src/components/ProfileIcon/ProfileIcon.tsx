import React from 'react';

import { toSvg } from 'jdenticon';

interface ProfileIconProps {
  title: string;
  size: number;
  backgroundColor?: string;
}

const ProfileIcon = ({
  title,
  size = 40,
  backgroundColor = '#fff',
}: ProfileIconProps) => {
  const nodeIcon = toSvg(title, size, { backColor: backgroundColor });
  return (
    <div
      // eslint-disable-next-line
      dangerouslySetInnerHTML={{ __html: nodeIcon }}
    />
  );
};

export default ProfileIcon;
