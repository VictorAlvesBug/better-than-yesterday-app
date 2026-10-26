import { Penalty } from '@/types/penalty.type';
import { mapPenaltyFromApi } from '../utils/apiMappers';
import { backendApi } from '../utils/apiUtils';

export default function createPenaltyRepository() {
  const listByChallengeId = async (challengeId: string): Promise<Penalty[]> => {
    const penalties = await backendApi.listPenaltiesByChallengeId(challengeId);
    return penalties.map(mapPenaltyFromApi);
  };

  const listByChallengeMember = async (challengeId: string, userId: string): Promise<Penalty[]> => {
    const penalties = await backendApi.listPenaltiesByChallengeMember(challengeId, userId);
    return penalties.map(mapPenaltyFromApi);
  };

  const pay = async (challengeId: string, penaltyId: string, confirmedByUserId: string): Promise<Penalty> => {
    const penalty = await backendApi.payPenalty(challengeId, penaltyId, confirmedByUserId);
    return mapPenaltyFromApi(penalty);
  };

  const createPixCharge = async (challengeId: string, penaltyId: string, userId: string) => {
    return backendApi.createPixCharge(challengeId, penaltyId, userId);
  };

  return { listByChallengeId, listByChallengeMember, pay, createPixCharge };
}
