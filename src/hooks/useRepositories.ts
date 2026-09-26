import { useMemo } from 'react';
import createCheckinRepository from '../api/checkinRepository';
import createPenaltyRepository from '../api/penaltyRepository';
import createPlanRepository from '../api/planRepository';
import createRankingRepository from '../api/rankingRepository';
import createUserRepository from '../api/userRepository';

export function useRepositories() {
  return useMemo(
    () => ({
      plan: createPlanRepository(),
      checkin: createCheckinRepository(),
      ranking: createRankingRepository(),
      penalty: createPenaltyRepository(),
      user: createUserRepository(),
    }),
    []
  );
}
