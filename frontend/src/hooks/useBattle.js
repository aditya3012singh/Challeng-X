import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

/**
 * Hook for battle data with WebSocket invalidation
 */
export const useBattle = (battleId) => {
  return useQuery({
    queryKey: ['battle', battleId],
    queryFn: () => api.get(`/battle/${battleId}`).then(res => res.data),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: false,
    enabled: !!battleId,
  });
};

// Hook for live battles
export const useLiveBattles = () => {
  return useQuery({
    queryKey: ['liveBattles'],
    queryFn: () => api.get('/battle/live').then(res => res.data),
    staleTime: 15 * 1000, // 15 seconds
  });
};
