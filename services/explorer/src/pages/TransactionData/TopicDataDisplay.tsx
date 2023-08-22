import { Box, Dropdown, Typography } from '@taraxa_project/taraxa-ui';
import { useState } from 'react';
import useStyles from '../../components/DataRow/DataRow.styles';

export interface EventDataProps {
  title: string;
  hexValue: string;
}

export const TopicDataDisplay = ({ title, hexValue }: EventDataProps) => {
  const classes = useStyles();

  const toggleValues = [
    { value: 'hex', label: 'Hex' },
    { value: 'dec', label: 'Dec' },
  ];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const [decoded, setDecoded] = useState<string>(hexValue);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (val: string) => {
    setValue(val);
    setAnchorEl(null);
    switch (val) {
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

  const currentValue =
    toggleValues.find((item) => item.value === value) || toggleValues[0];

  return (
    <Box className={classes.wrapper} marginTop='0.5rem' marginBottom='0.5rem'>
      <Typography
        color='text.secondary'
        textTransform='uppercase'
        variant='subtitle1'
        component='p'
        width='14rem'
      >
        {title}:
      </Typography>
      <Box width='6rem'>
        <Dropdown
          buttonColor='inherit'
          anchorEl={anchorEl}
          open={open}
          currentValue={currentValue}
          menuItems={toggleValues}
          handleClick={handleClick}
          handleClose={handleClose}
          buttonStyle={{ padding: '9px' }}
        />
      </Box>
      <Box className={classes.dataContainer}>{decoded}</Box>
    </Box>
  );
};
