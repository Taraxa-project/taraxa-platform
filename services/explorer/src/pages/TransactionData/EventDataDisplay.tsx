import { BaseToggleButtonGroup, Box } from '@taraxa_project/taraxa-ui';
import { DataRow } from '../../components';
import { useState } from 'react';

export interface EventDataProps {
  hexValue: string;
}

export const EventDataDisplay = ({ hexValue }: EventDataProps) => {
  const toggleValues = [
    { value: 'hex', label: 'Hex' },
    { value: 'dec', label: 'Dec' },
  ];

  const [decoded, setDecoded] = useState<string>(hexValue);
  const [selected, setSelected] = useState<string>(toggleValues[0].value);

  const onChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    const found = toggleValues.find((toggle) => toggle.value === newValue);

    setSelected(found.value);
    switch (newValue) {
      case toggleValues[0].value:
        setDecoded(hexValue);
        break;
      case toggleValues[1].value:
        const addressHex = '0x' + hexValue.slice(-40);
        const addressDecimal = BigInt(addressHex).toString();
        setDecoded(addressDecimal);
        break;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'row' },
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <DataRow key={`${decoded}`} title='Data' data={`${decoded}`} />
      <BaseToggleButtonGroup
        currentValue={selected}
        exclusive
        data={toggleValues}
        onChange={onChange}
      />
    </Box>
  );
};
