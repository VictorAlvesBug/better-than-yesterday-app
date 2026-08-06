import { PlanRanking, PlanRankingWithCurrentUser } from '@/types/ranking.type';
import { mapPlanRankingFromApi, mapPlanRankingWithCurrentUserFromApi } from '../utils/apiMappers';
import { backendApi } from '../utils/apiUtils';

export default function createRankingRepository() {
    const getByPlanId = async (planId: string): Promise<PlanRanking> => {
        const ranking = await backendApi.getPlanRanking(planId);
        return mapPlanRankingFromApi(ranking);
    };
    const getByPlanIdAndUserId = async (planId: string, userId: string): Promise<PlanRankingWithCurrentUser> => {
        const ranking = await backendApi.getPlanRankingWithCurrentUser(planId, userId);
        return mapPlanRankingWithCurrentUserFromApi(ranking);
    };

    return { getByPlanId, getByPlanIdAndUserId };
}
