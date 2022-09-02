import React from 'react';
import { DiscordIcon, SendIcon, TwitterIcon } from '../icons';

export type FooterItem = {
  label: string;
  Icon: JSX.Element;
};

export const useFooterEffects = (): { items: FooterItem[] } => {
  const items: FooterItem[] = [
    {
      label: 'Send',
      Icon: (
        <a href='https://www.taraxa.io/tg' target='_blank' rel='noreferrer'>
          <SendIcon />
        </a>
      ),
    },
    {
      label: 'Discord',
      Icon: (
        <a
          href='https://www.taraxa.io/discord'
          target='_blank'
          rel='noreferrer'
        >
          <DiscordIcon />
        </a>
      ),
    },
    {
      label: 'Twitter',
      Icon: (
        <a
          href='https://www.taraxa.io/twitter'
          target='_blank'
          rel='noreferrer'
        >
          <TwitterIcon />
        </a>
      ),
    },
  ];

  return { items };
};
