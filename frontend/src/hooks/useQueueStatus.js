import { useQuery } from '@tanstack/react-query';
import { getQueueStatus } from '../../store/api/matchmaking.thunk';
import { useDispatch } from 'react-redux';

/**
 * Hook for queue status with caching
 */
export const useQueueStatus = () => {
  const dispatch = useDispatch();

  const { data: queueStatus, isLoading, error } = useQuery({
    queryKey: ['queueStatus'],
    queryFn: async () => {
      // Call the Redux thunk
      const result = await dispatch(getQueueStatus()).unwrap();
      return result;
    },
    staleTime: 2000, // 2 seconds (matches polling interval)
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });

  return {
    queueStatus,
    isLoading,
    error,
  };
};
