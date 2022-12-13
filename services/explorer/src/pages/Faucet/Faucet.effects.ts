/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { sendRequestTokens } from '../../api';
import { RequestLimit, ToastData } from '../../utils';
import { useExplorerNetwork } from '../../hooks/useExplorerNetwork';
import { useExplorerLoader } from '../../hooks/useLoader';

export const useFaucetEffects = () => {
  const { currentNetwork } = useExplorerNetwork();
  const { isLoading, initLoading, finishLoading } = useExplorerLoader();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [amount, setAmount] = useState(RequestLimit.ONE);
  const [displayToast, setDisplayToast] = useState<ToastData>({
    display: false,
    variant: undefined,
    text: '',
  });

  const defaultValues = {
    address: '',
    amount: RequestLimit.ONE,
  };

  const validationSchema = yup
    .object({
      address: yup
        .string()
        .min(42)
        .max(42)
        .notOneOf(['0x0'])
        .required('Please specify the recipient address')
        .label('Recipient Address'),
      amount: yup
        .number()
        .min(RequestLimit.ONE)
        .max(RequestLimit.SEVEN)
        .required('Please specify the requested amount')
        .label('TARA amount'),
    })
    .required();

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { isSubmitSuccessful, errors },
  } = useForm({
    reValidateMode: 'onChange',
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  const requestTokens = async (data: { address: string; amount: number }) => {
    initLoading();
    await sendRequestTokens(
      data.address,
      data.amount,
      currentNetwork,
      setDisplayToast
    );
    finishLoading();
  };

  const onSubmit = async (data: { address: string; amount: number }) => {
    await requestTokens(data);
    setAmount(RequestLimit.ONE);
    reset();
  };

  useEffect(() => {
    if (displayToast.display) {
      enqueueSnackbar(displayToast.text, {
        variant: displayToast.variant,
        autoHideDuration: 3000,
      });
    }
  }, [displayToast]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return {
    amount,
    setAmount,
    isLoading,
    currentNetwork,
    onSubmit,
    closeSnackbar,
    handleSubmit,
    register,
    control,
    errors,
  };
};
