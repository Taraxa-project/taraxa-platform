import React from 'react';
import { Skeleton } from '@mui/material';

const NodeProfilePageSkeleton = (): JSX.Element => {
  return (
    <div className="nodeInfoWrapper">
      <div className="nodeInfoFlex">
        <div className="nodeInfoColumn">
          <div className="nicknameWrapper">
            <Skeleton className="skeleton" variant="circular" width={40} height={40} />
            <div className="nicknameContainer">
              <Skeleton
                className="skeleton"
                variant="text"
                sx={{ fontSize: '22px', width: '550px', marginLeft: '10px' }}
              />
              <Skeleton
                className="skeleton"
                variant="text"
                sx={{ fontSize: '22px', width: '550px', marginLeft: '10px' }}
              />
            </div>
          </div>
          <div className="nodeInfoTitle">
            <Skeleton
              className="skeleton"
              variant="text"
              sx={{ fontSize: '14px', width: '200px' }}
            />
          </div>
          <div className="nodeInfoContent">
            <Skeleton
              className="skeleton"
              variant="text"
              sx={{ fontSize: '14px', width: '200px' }}
            />
          </div>
          <div className="nodeInfoTitle">
            <Skeleton
              className="skeleton"
              variant="text"
              sx={{ fontSize: '14px', width: '200px' }}
            />
          </div>
          <div className="nodeInfoContent">
            <Skeleton
              className="skeleton"
              variant="text"
              sx={{ fontSize: '14px', width: '200px' }}
            />
          </div>
        </div>
        <div className="nodeDelegationColumn">
          <div className="taraContainerWrapper">
            <div className="taraContainer">
              <Skeleton className="skeleton" variant="rectangular" width={200} height={80} />
              <Skeleton className="skeleton" variant="text" sx={{ fontSize: '12px' }} />
            </div>
            <div className="taraContainer">
              <Skeleton className="skeleton" variant="rectangular" width={200} height={80} />
              <Skeleton className="skeleton" variant="text" sx={{ fontSize: '12px' }} />
            </div>
          </div>
          <div className="delegationButtons">
            <Skeleton
              className="skeleton"
              variant="rectangular"
              width={316}
              height={48}
              style={{ marginBottom: '10px' }}
            />
            <Skeleton className="skeleton" variant="rectangular" width={316} height={48} />
          </div>
        </div>
      </div>
      {/* <Stack spacing={4}>
        <Skeleton className="skeleton" variant="circular" width={40} height={40} />
        <Skeleton className="skeleton" variant="rectangular" />
        <Skeleton className="skeleton" variant="rectangular" />
        <Divider light />
        <Skeleton className="skeleton" variant="rectangular" />
        <Skeleton className="skeleton" variant="rectangular" />
        <Skeleton className="skeleton" variant="rectangular" />
        <Skeleton className="skeleton" variant="rectangular" />
      </Stack> */}
    </div>
  );
};

export default NodeProfilePageSkeleton;
