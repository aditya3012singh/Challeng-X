import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

/**
 * Hook for global stats with caching
 */
export const useGlobalStats = () => {
  return useQuery({
    queryKey: ['globalStats'],
    queryFn: () => api.get('/analytics/global/stats').then(res => res.data),
    staleTime: 30 * 1000, // 30 seconds
  });
};
