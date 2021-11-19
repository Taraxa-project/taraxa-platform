import { useCallback } from 'react';
import { useAuth } from './useAuth';
import useApi from './useApi';

const useBounties = () => {
  const { get } = useApi();
  const { isLoggedIn, user } = useAuth();

  let userId: number | undefined;
  if (isLoggedIn) {
    userId = user!.id;
  }

  const getBountyUserSubmissionsCount = useCallback(
    async (bountyId: number | string): Promise<number> => {
      if (isLoggedIn) {
        const userSubmissionsCountRequest = await get(
          `/submissions/count?bounty=${bountyId}&user=${userId}`,
        );
        if (userSubmissionsCountRequest.success) {
          return userSubmissionsCountRequest.response;
        }
      }
      return 0;
    },
    [get, isLoggedIn, userId],
  );

  return { getBountyUserSubmissionsCount };
};

export default useBounties;
