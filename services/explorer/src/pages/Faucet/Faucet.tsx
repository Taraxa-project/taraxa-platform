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
    amount,
    setAmount,
    currentNetwork,
    onSubmit,
    handleSubmit,
    register,
    errors,
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
        <form
          autoComplete='off'
          onSubmit={handleSubmit(onSubmit)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginBottom: '6rem',
            gap: '2rem',
          }}
        >
          <FormControl>
            <InputField
              label={`Your address on ${currentNetwork}`}
              placeholder='0x00000000000000000000000000'
              name='address'
              style={{ width: '30rem' }}
              {...register('address')}
            />
            {errors.address && (
              <FormHelperText color='danger'>
                {errors.address.message}
              </FormHelperText>
            )}
          </FormControl>
          <FormControl>
            <Select
              name='amount'
              value={amount}
              {...register('amount')}
              onChange={(e) => setAmount(+e.target.value)}
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
            {errors.amount && (
              <FormHelperText color='danger'>
                {errors.amount.message}
              </FormHelperText>
            )}
            <FormHelperText>{`You are requesting ${amount} TARA tokens`}</FormHelperText>
          </FormControl>
          <Button
            variant='contained'
            color='secondary'
            size='medium'
            type='submit'
            label={`Request ${amount} TARA`}
            disabled={
              errors.address !== undefined || errors.amount !== undefined
            }
          />
        </form>
      </Box>
    </Box>
  );
};

export default FaucetPage;
