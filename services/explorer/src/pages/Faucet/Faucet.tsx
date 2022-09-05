import React from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Button, InputField } from '@taraxa_project/taraxa-ui';
import AccessAlarmSharpIcon from '@mui/icons-material/AccessAlarmSharp';
import moment from 'moment';
import { Controller } from 'react-hook-form';
import { RequestLimit } from '../../utils';
import { PageTitle } from '../../components';
import { useFaucetEffects } from './Faucet.effects';
import useStyles from './Faucet.styles';

const FaucetPage = (): JSX.Element => {
  const { amount, setAmount, control, currentNetwork, onSubmit, handleSubmit } =
    useFaucetEffects();
  const classes = useStyles();

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
          className={classes.form}
          autoComplete='off'
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            name='address'
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <InputField
                className={classes.address}
                label={`Your address on ${currentNetwork}`}
                value={value}
                type='text'
                name='address'
                error={!!error}
                onChange={onChange}
                helperText={error ? error.message : null}
              />
            )}
          />
          <Controller
            name='amount'
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormControl error={!!error} className={classes.amount}>
                <Select
                  name='amount'
                  value={value}
                  error={!!error}
                  onChange={(e: any) => {
                    onChange(e);
                    setAmount(+e.target.value);
                  }}
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
                <FormHelperText>{error ? error.message : null}</FormHelperText>
                <FormHelperText>{`You are requesting ${amount} TARA tokens`}</FormHelperText>
              </FormControl>
            )}
          />
          <Button
            className={classes.button}
            variant='contained'
            color='secondary'
            size='medium'
            type='submit'
            label={`Request ${amount} TARA`}
          />
        </form>
      </Box>
    </Box>
  );
};

export default FaucetPage;
