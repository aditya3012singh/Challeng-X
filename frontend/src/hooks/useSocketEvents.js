import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../../lib/socket';

/**
 * Hook to handle socket events and invalidate queries
 */
export const useSocketEvents = () => {
  const queryClient = useQueryClient();
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for submission results
    socket.on('submission_result', (data) => {
      // Invalidate submission queries
      queryClient.invalidateQueries({ queryKey: ['submission', data.submissionId] });
      
      // Invalidate battle queries if battleId is present
      if (data.battleId) {
        queryClient.invalidateQueries({ queryKey: ['battle', data.battleId] });
      }
      
      // Invalidate contest queries if contestId is present
      if (data.contestId) {
        queryClient.invalidateQueries({ queryKey: ['contest', data.contestId] });
      }
    });

    // Listen for battle updates
    socket.on('battle_update', (data) => {
      queryClient.invalidateQueries({ queryKey: ['battle', data.battleId] });
    });

    // Listen for contest updates
    socket.on('contest_update', (data) => {
      queryClient.invalidateQueries({ queryKey: ['contest', data.contestId] });
    });

    // Listen for leaderboard updates
    socket.on('leaderboard_update', (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    });

    // Listen for global stats updates
    socket.on('global_stats_update', (data) => {
      queryClient.invalidateQueries({ queryKey: ['globalStats'] });
    });

    return () => {
      socket.off('submission_result');
      socket.off('battle_update');
      socket.off('contest_update');
      socket.off('leaderboard_update');
      socket.off('global_stats_update');
    };
  }, [queryClient, socket]);
};
