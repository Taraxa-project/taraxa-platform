import React from 'react';
import {
  Box,
  Typography,
  Button,
  InputField,
  MenuItem,
  FormControl,
  FormHelperText,
  Select,
  MuiIcons,
} from '@taraxa_project/taraxa-ui';
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
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        marginTop='8rem'
        marginBottom='1rem'
        gap='0.5rem'
      >
        <MuiIcons.AccessAlarmSharp color='error' />
        <Typography variant='subtitle1' component='h4'>
          {`Withdrawing ${amount} TARA will get you locked out until ${moment(
            new Date().setDate(new Date().getDate() + amount)
          ).format('DD/MM/YY HH:mm:ss')}`}
        </Typography>
      </Box>
      <Box
        display='flex'
        flexDirection='column'
        width='100%'
        justifyContent='center'
        marginBottom='6rem'
      >
        <Box
          display='flex'
          flexDirection='row'
          width='100%'
          justifyContent='center'
          alignItems='flex-start'
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
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
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
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
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
                  <FormHelperText>
                    {error ? error.message : null}
                  </FormHelperText>
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
        <Typography
          variant='subtitle1'
          component='h4'
          marginTop='2rem'
          marginBottom='1rem'
          textAlign={'center'}
        >
          If you believe you have a good reason to request more than 1 TARA for
          testing, please talk to an admin in our Discord: taraxa.io/discord.
        </Typography>
      </Box>
    </Box>
  );
};

export default FaucetPage;
