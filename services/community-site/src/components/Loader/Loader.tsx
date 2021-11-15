// import { useMediaQuery } from 'react-responsive';
import { Notification } from '@taraxa_project/taraxa-ui';
import { useLoading } from '../../services/useLoading';

import './loader.scss';

const Loader = () => {
  const { isLoading } = useLoading();
  // const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  if (!isLoading) {
    return null;
  }
  
  return <Notification variant="danger">Loading...</Notification>;
};

export default Loader;
