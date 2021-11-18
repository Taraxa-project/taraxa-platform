import { useLoading } from '../../services/useLoading';
import { LoadingWidget as TLoadingWidget } from '@taraxa_project/taraxa-ui';

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
