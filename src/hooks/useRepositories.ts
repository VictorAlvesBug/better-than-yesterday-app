import { useMemo } from 'react';
import createCheckinRepository from '../api/checkinRepository';
import createDayOffRepository from '../api/dayOffRepository';
import createPlanRepository from '../api/planRepository';
import createRankingRepository from '../api/rankingRepository';
import createUserRepository from '../api/userRepository';

export function useRepositories() {
  return useMemo(
    () => ({
      plan: createPlanRepository(),
      checkin: createCheckinRepository(),
      ranking: createRankingRepository(),
      dayOff: createDayOffRepository(),
      user: createUserRepository(),
    }),
    []
  );
}
