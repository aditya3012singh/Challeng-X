import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

/**
 * Hook for contest details with parallel queries
 */
export const useContest = (id) => {
  // Contest details
  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: ['contest', id],
    queryFn: () => api.get(`/contest/${id}`).then(res => res.data.contest),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!id,
  });

  // Problems (only fetch if contest is not upcoming)
  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ['contest', id, 'problems'],
    queryFn: () => api.get(`/contest/${id}/problems`).then(res => res.data.problems),
    staleTime: 60 * 1000,
    enabled: !!id && contest?.status !== 'UPCOMING',
  });

  // Leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['contest', id, 'leaderboard'],
    queryFn: () => api.get(`/contest/${id}/leaderboard`).then(res => res.data.leaderboard),
    staleTime: 30 * 1000, // 30 seconds (changes frequently)
    enabled: !!id,
  });

  const isLoading = contestLoading || problemsLoading || leaderboardLoading;

  return {
    contest,
    problems,
    leaderboard,
    isLoading,
  };
};
