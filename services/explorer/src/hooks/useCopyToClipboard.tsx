import { useSnackbar } from 'notistack';

export const useCopyToClipboard = (): (() => void) => {
  const { enqueueSnackbar } = useSnackbar();

  const onCopy = () => {
    enqueueSnackbar('Copied', {
      variant: 'success',
    });
  };

  return onCopy;
};
