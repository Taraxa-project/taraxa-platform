import { useMediaQuery } from 'react-responsive';
import { LoadingWidget as TLoadingWidget } from '@taraxa_project/taraxa-ui';
import { useLoading } from '../../services/useLoading';

import './loading-widget.scss';

const LoadingWidget = () => {
  const { isLoading } = useLoading();

  return (
    <TLoadingWidget
      isLoading={isLoading}
      widgetId="loadingWidget"
      progressId="loadingWidgetProgress"
    />
  );
};

export default LoadingWidget;
