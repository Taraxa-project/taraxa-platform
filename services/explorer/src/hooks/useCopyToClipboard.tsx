import { useSnackbar } from 'notistack';

export const useCopyToClipboard = () => {
  const { enqueueSnackbar } = useSnackbar();

  const onCopy = () => {
    enqueueSnackbar('Copied', {
      variant: 'success',
    });
  };

  return onCopy;
};
