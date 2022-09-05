import React from 'react';
import { LoadingWidget as TWidget } from '@taraxa_project/taraxa-ui';
import { useExplorerLoader } from '../../hooks/useLoader';

import './loading-widget.scss';

const LoadingWidget = () => {
  const { isLoading } = useExplorerLoader();
  return (
    <TWidget
      isLoading={isLoading}
      widgetId='loadingWidget'
      progressId='loadingWidgetProgress'
    />
  );
};

export default LoadingWidget;
