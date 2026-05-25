import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

/**
 * Custom hook for API calls with TanStack Query
 * Provides caching, loading states, and error handling
 */
export const useApi = () => {
  const queryClient = useQueryClient();

  // Query helpers
  const useGet = (key, url, options = {}) => {
    return useQuery({
      queryKey: [key],
      queryFn: () => api.get(url).then(res => res.data),
      ...options,
    });
  };

  const useGetById = (key, id, url, options = {}) => {
    return useQuery({
      queryKey: [key, id],
      queryFn: () => api.get(`${url}/${id}`).then(res => res.data),
      enabled: !!id,
      ...options,
    });
  };

  const usePost = (key, url, options = {}) => {
    return useMutation({
      mutationKey: [key],
      mutationFn: (data) => api.post(url, data).then(res => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
        if (options.onSuccess) options.onSuccess();
      },
      ...options,
    });
  };

  const usePut = (key, url, options = {}) => {
    return useMutation({
      mutationKey: [key],
      mutationFn: ({ id, data }) => api.put(`${url}/${id}`, data).then(res => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
        if (options.onSuccess) options.onSuccess();
      },
      ...options,
    });
  };

  const useDelete = (key, url, options = {}) => {
    return useMutation({
      mutationKey: [key],
      mutationFn: (id) => api.delete(`${url}/${id}`).then(res => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [key] });
        if (options.onSuccess) options.onSuccess();
      },
      ...options,
    });
  };

  // Parallel queries helper
  const useParallelQueries = (queries) => {
    return Promise.all(queries.map(q => api.get(q.url).then(res => res.data)));
  };

  // Prefetch helper
  const prefetchQuery = (key, url) => {
    queryClient.prefetchQuery({
      queryKey: [key],
      queryFn: () => api.get(url).then(res => res.data),
    });
  };

  return {
    useGet,
    useGetById,
    usePost,
    usePut,
    useDelete,
    useParallelQueries,
    prefetchQuery,
    queryClient,
  };
};
