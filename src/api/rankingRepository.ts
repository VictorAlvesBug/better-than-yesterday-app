import { PlanRanking } from '@/types/ranking.type';
import { mapPlanRankingFromApi } from '../utils/apiMappers';
import { backendApi } from '../utils/apiUtils';

export default function createRankingRepository() {
    const getByPlanId = async (planId: string, userId?: string): Promise<PlanRanking> => {
        const ranking = await backendApi.getPlanRanking(planId, userId);
        return mapPlanRankingFromApi(ranking);
    };

    return { getByPlanId };
}
