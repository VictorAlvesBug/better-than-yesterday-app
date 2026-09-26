import { Penalty } from '@/types/penalty.type';
import { mapPenaltyFromApi } from '../utils/apiMappers';
import { backendApi } from '../utils/apiUtils';

export default function createPenaltyRepository() {
  const listByPlanId = async (planId: string): Promise<Penalty[]> => {
    const penalties = await backendApi.listPenaltiesByPlanId(planId);
    return penalties.map(mapPenaltyFromApi);
  };

  const listByPlanMember = async (planId: string, userId: string): Promise<Penalty[]> => {
    const penalties = await backendApi.listPenaltiesByPlanMember(planId, userId);
    return penalties.map(mapPenaltyFromApi);
  };

  const pay = async (planId: string, penaltyId: string, confirmedByUserId: string): Promise<Penalty> => {
    const penalty = await backendApi.payPenalty(planId, penaltyId, confirmedByUserId);
    return mapPenaltyFromApi(penalty);
  };

  return { listByPlanId, listByPlanMember, pay };
}
