
import { CreateChallenge, ManageChallengeMember, ChallengeEnriched, ChallengeMemberEnriched, ChallengeWithMembers, UserWithChallenges } from '@/types/challenge.type';
import {
    mapChallengeFromApi,
    mapChallengeMemberEnrichedFromDetails,
    mapChallengeWithMembersFromApi,
    mapUserWithChallengesFromApi,
} from '../utils/apiMappers';
import { backendApi, ListChallengesFilter } from '../utils/apiUtils';

export default function createChallengeRepository() {
    const oneChallengeWithEnrichment = async (challengeId: string, memberCount = 0): Promise<ChallengeEnriched> => {
        const challenge = await backendApi.getChallengeById(challengeId);
        return mapChallengeFromApi(challenge, memberCount);
    }

    const listByUserId = async (userId: string): Promise<ChallengeEnriched[]> => {
        console.log("ChallengeRepository.listByUserId - userId:", userId);
        const { challenges } = await getUserWithChallengesByUserId(userId);
        return challenges;
    }

    const list = async (filter?: ListChallengesFilter): Promise<ChallengeEnriched[]> => {
        console.log("ChallengeRepository.list - filter:", filter);
        const challenges = await backendApi.listChallenges(filter);
        return Promise.all(challenges.map(async (challenge) => {
            const { users } = await getChallengeWithMembersByChallengeId(challenge.id);
            return mapChallengeFromApi(challenge, users.length)
        }));
    };

    const listByChallengeIds = async (challengeIds: string[]): Promise<ChallengeEnriched[]> => {
        console.log("ChallengeRepository.listByChallengeIds - challengeIds:", challengeIds);
        const tasks = challengeIds.map(async challengeId => getById(challengeId));
        return Promise.all(tasks);
    };

    const getChallengeWithMembersByChallengeId = async (challengeId: string): Promise<ChallengeWithMembers> => {
        console.log("ChallengeRepository.getChallengeWithMembersByChallengeId - challengeId:", challengeId);
        const data = await backendApi.getChallengeWithMembersByChallengeId(challengeId);
        return mapChallengeWithMembersFromApi(data);
    };

    const getUserWithChallengesByUserId = async (userId: string): Promise<UserWithChallenges> => {
        console.log("ChallengeRepository.getUserWithChallengesByUserId - userId:", userId);
        const data = await backendApi.getUserWithChallengesByUserId(userId);
        return mapUserWithChallengesFromApi(data);
    };

    const getChallengeMemberDetails = async (challengeId: string, userId: string): Promise<ChallengeMemberEnriched> => {
        console.log("ChallengeRepository.getChallengeMemberDetails - challengeId:", challengeId, "userId:", userId);
        const data = await backendApi.getChallengeMemberDetails(challengeId, userId);
        return mapChallengeMemberEnrichedFromDetails(data);
    };

    const getById = async (id: string): Promise<ChallengeEnriched> => {
        console.log("ChallengeRepository.getById - id:", id);
        const { users } = await getChallengeWithMembersByChallengeId(id);
        return oneChallengeWithEnrichment(id, users.length);
    };

    const create = async (createChallenge: CreateChallenge): Promise<ChallengeEnriched> => {
        console.log("ChallengeRepository.create - createChallenge:", createChallenge);
        const challengeCreated = await backendApi.createChallenge(createChallenge);
        return mapChallengeFromApi(challengeCreated, 0);
    };

    const join = async (createChallengeMember: ManageChallengeMember): Promise<ChallengeMemberEnriched> => {
        console.log("ChallengeRepository.join - createChallengeMember:", createChallengeMember);
        const challengeMemberCreated = await backendApi.joinChallenge(createChallengeMember.challengeId, createChallengeMember.userId);
        return mapChallengeMemberEnrichedFromDetails(challengeMemberCreated);
    };

    const leave = async (deleteChallengeMember: ManageChallengeMember): Promise<void> => {
        console.log("ChallengeRepository.leave - deleteChallengeMember:", deleteChallengeMember);
        await backendApi.leaveChallenge(deleteChallengeMember.challengeId, deleteChallengeMember.userId);
    };

    const block = async (blockChallengeMember: ManageChallengeMember): Promise<ChallengeMemberEnriched> => {
        console.log("ChallengeRepository.block - blockChallengeMember:", blockChallengeMember);
        const challengeMemberUpdated = await backendApi.blockChallengeMember(blockChallengeMember.challengeId, blockChallengeMember.userId);
        return mapChallengeMemberEnrichedFromDetails(challengeMemberUpdated);
    };

    const unblock = async (unblockChallengeMember: ManageChallengeMember): Promise<void> => {
        console.log("ChallengeRepository.unblock - unblockChallengeMember:", unblockChallengeMember);
        await backendApi.unblockChallengeMember(unblockChallengeMember.challengeId, unblockChallengeMember.userId);
    };

    const updatePeriod = async (challengeId: string, ownerId: string, startsAt: string, endsAt: string) => {
        await backendApi.updateChallengePeriod(challengeId, { ownerId, startsAt, endsAt });
    };

    const cancel = async (challengeId: string) => {
        await backendApi.cancelChallenge(challengeId);
    };

    return {
        list,
        getChallengeWithMembersByChallengeId,
        getUserWithChallengesByUserId,
        getChallengeMemberDetails,
        listByUserId,
        getById,
        create,
        join,
        leave,
        block,
        unblock,
        updatePeriod,
        cancel,
    }
}
