import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

/**
 * Hook for problems with caching and prefetching
 */
export const useProblems = () => {
  // Get all problems (cached for 5 minutes)
  const { data: problems, isLoading, error } = useQuery({
    queryKey: ['problems', 'list'],
    queryFn: () => api.get('/problem/list').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get single problem (cached for 1 minute)
  const useProblemById = (id) => {
    return useQuery({
      queryKey: ['problem', id],
      queryFn: () => api.get(`/problem/${id}`).then(res => res.data),
      staleTime: 60 * 1000, // 1 minute
      enabled: !!id,
    });
  };

  // Prefetch problem details (for hover effects)
  const prefetchProblem = (id) => {
    // This would be called on hover
    // queryClient.prefetchQuery({
    //   queryKey: ['problem', id],
    //   queryFn: () => api.get(`/problem/${id}`).then(res => res.data),
    // });
  };

  return {
    problems,
    isLoading,
    error,
    useProblemById,
    prefetchProblem,
  };
};
