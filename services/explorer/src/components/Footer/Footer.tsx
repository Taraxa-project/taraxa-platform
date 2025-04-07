import React from 'react';
import { Footer as TFooter } from '@taraxa_project/taraxa-ui';
import { useFooterEffects } from './Footer.effects';

export const Footer = (): JSX.Element => {
  const { items } = useFooterEffects();

  return (
    <TFooter
      description="Taraxa is supercharging DeFi & Social AI with the world's only EVM-compatible blockDAG Layer-1."
      links={[{ label: 'Privacy Policy', link: 'https://taraxa.io/privacy' }]}
      items={items}
    />
  );
};
