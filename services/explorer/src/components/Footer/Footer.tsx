import React from 'react';
import { Footer as TFooter } from '@taraxa_project/taraxa-ui';
import { useFooterEffects } from './Footer.effects';

export const Footer = (): JSX.Element => {
  const { items } = useFooterEffects();

  return (
    <TFooter
      description='Taraxa is a public ledger platform purpose-built for audit logging of informal transactions.'
      links={[{ label: 'Privacy Policy', link: 'https://taraxa.io/privacy' }]}
      items={items}
    />
  );
};
