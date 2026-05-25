import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

/**
 * Hook for leaderboard with caching
 */
export const useLeaderboard = ({ page = 1, limit = 20, filter = 'GLOBAL' } = {}) => {
  return useQuery({
    queryKey: ['leaderboard', page, limit, filter],
    queryFn: () => api.get('/leaderboard', { params: { page, limit, filter } }).then(res => res.data),
    staleTime: 30 * 1000, // 30 seconds (leaderboard changes frequently)
  });
};
