import {
  Box,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Button, InputField } from '@taraxa_project/taraxa-ui';
import React from 'react';
import AccessAlarmSharpIcon from '@mui/icons-material/AccessAlarmSharp';
import moment from 'moment';
import { RequestLimit } from '../../utils';
import { PageTitle } from '../../components';
import { useFaucetEffects } from './Faucet.effects';

const FaucetPage = (): JSX.Element => {
  const {
    address,
    setAddress,
    amount,
    setAmount,
    currentNetwork,
    sendTokenRequest,
  } = useFaucetEffects();

  return (
    <Box display='flex' flexDirection='column' alignItems='center'>
      <PageTitle
        title={`${currentNetwork} Faucet`}
        subtitle={`Request ${currentNetwork} TARA tokens to build and test our your DApps.The daily withdrawal limit on the ${currentNetwork} is 1 TARA. You can claim up to seven days' tokens in advance, each token locking you out for one day.`}
      />
      <Typography
        variant='subtitle1'
        component='h4'
        marginTop='8rem'
        marginBottom='1rem'
      >
        <AccessAlarmSharpIcon color='error' />{' '}
        {`Withdrawing ${amount} TARA will get you locked out until ${moment(
          new Date().setDate(new Date().getDate() + amount)
        ).format('DD/MM/YY HH:mm:ss')}`}
      </Typography>
      <Box
        display='flex'
        flexDirection='row'
        width='100%'
        justifyContent='center'
        alignItems='flex-start'
        marginBottom='6rem'
        gap='2rem'
      >
        <FormControl>
          <InputField
            label={`Your address on ${currentNetwork}`}
            placeholder='0x00000000000000000000000000'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '30rem' }}
          />
        </FormControl>
        <FormControl>
          <Select
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value in RequestLimit ? Number(e.target.value) : 0
              )
            }
          >
            {Object.keys(RequestLimit)
              .map((k) => Number(k))
              .filter(Number)
              .map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
          </Select>
          <FormHelperText>{`You are requesting ${amount} TARA tokens`}</FormHelperText>
        </FormControl>
        <Button
          variant='contained'
          color='secondary'
          size='medium'
          label={`Request ${amount} TARA`}
          onClick={sendTokenRequest}
          disabled={!address && address.length < 1}
        />
      </Box>
    </Box>
  );
};

export default FaucetPage;
