import { ChallengeRanking, ChallengeRankingWithCurrentUser } from '@/types/ranking.type';
import { mapChallengeRankingFromApi, mapChallengeRankingWithCurrentUserFromApi } from '../utils/apiMappers';
import { backendApi } from '../utils/apiUtils';

export default function createRankingRepository() {
    const getByChallengeId = async (challengeId: string): Promise<ChallengeRanking> => {
        const ranking = await backendApi.getChallengeRanking(challengeId);
        return mapChallengeRankingFromApi(ranking);
    };
    const getByChallengeIdAndUserId = async (challengeId: string, userId: string): Promise<ChallengeRankingWithCurrentUser> => {
        const ranking = await backendApi.getChallengeRankingWithCurrentUser(challengeId, userId);
        return mapChallengeRankingWithCurrentUserFromApi(ranking);
    };

    return { getByChallengeId, getByChallengeIdAndUserId };
}
