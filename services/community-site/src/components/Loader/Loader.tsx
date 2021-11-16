import { useMediaQuery } from 'react-responsive';
import { useLoading } from '../../services/useLoading';
import { Box, CircularProgress } from '@material-ui/core';

import './loader.scss';

const Loader = () => {
  const { isLoading } = useLoading();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const classeNames = [
    isMobile ? 'mobile-loaderWidget' : 'desktop-loaderWidget',
    isLoading ? 'show' : 'hide'
  ].join(" ")
  
  
  return <Box id={"loaderWidget"} className={classeNames}>
    <CircularProgress id="loaderWidgetProgress" size={35} thickness={4.5} /> Loading...
  </Box>;
};

export default Loader;
