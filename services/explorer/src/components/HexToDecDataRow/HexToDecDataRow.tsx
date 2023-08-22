import { BaseToggleButtonGroup, Box } from '@taraxa_project/taraxa-ui';
import { DataRow } from '../DataRow';
import { useState } from 'react';

export enum EncodedType {
  HEX = 'hex',
  DEC = 'dec',
}

export enum PrimitiveType {
  BOOL = 'boolean',
  ADDRESS = 'address',
  UINT = 'uint',
}

export interface HexToDecDataRowProps {
  title: string;
  data: string;
  initialState: EncodedType;
  primitiveType: PrimitiveType;
  formatDecimal?: (value: any) => string;
}

export const encodeToHex = (value: string, type: PrimitiveType): string => {
  switch (type) {
    case PrimitiveType.BOOL:
      return value ? '0x1' : '0x0';
    case PrimitiveType.ADDRESS:
      return value.padStart(66, '0'); // Assumes value starts with '0x'
    case PrimitiveType.UINT:
      return '0x' + BigInt(value).toString(16);
    default:
      return 'NA';
  }
};

export const decodeHexValue = (
  hexValue: string,
  type: PrimitiveType
): string | boolean => {
  switch (type) {
    case PrimitiveType.BOOL:
      return Boolean(Number(hexValue));
    case PrimitiveType.ADDRESS:
      const addressHex = '0x' + hexValue.slice(-40);
      const addressDecimal = BigInt(addressHex).toString();
      return addressDecimal;
    case PrimitiveType.UINT:
      return BigInt(hexValue).toString();
    default:
      return 'NA';
  }
};

export const HexToDecDataRow = ({
  title,
  data,
  initialState,
  primitiveType,
  formatDecimal,
}: HexToDecDataRowProps): JSX.Element => {
  const toggleValues = [
    { value: 'hex', label: 'Hex' },
    { value: 'dec', label: 'Dec' },
  ];

  const [displayValue, setDisplayValue] = useState<string | boolean>(
    initialState === EncodedType.HEX
      ? data
      : decodeHexValue(data, primitiveType)
  );
  const [selected, setSelected] = useState<string>(initialState);

  const displayData =
    selected === EncodedType.DEC && formatDecimal
      ? formatDecimal(displayValue)
      : displayValue;

  const onChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    if (!newValue) {
      return;
    }
    const found = toggleValues.find((toggle) => toggle.value === newValue);

    setSelected(found.value);
    if (newValue === EncodedType.HEX) {
      setDisplayValue(
        initialState === EncodedType.HEX
          ? data
          : encodeToHex(data, primitiveType)
      );
    } else {
      setDisplayValue(
        initialState === EncodedType.HEX
          ? decodeHexValue(data, primitiveType)
          : data
      );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <DataRow key={`${displayData}`} title={title} data={`${displayData}`} />
      {data !== '0x' && (
        <BaseToggleButtonGroup
          currentValue={selected}
          exclusive
          data={toggleValues}
          onChange={onChange}
        />
      )}
    </Box>
  );
};
