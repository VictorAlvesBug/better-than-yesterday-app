
import { CreatePlan, ManagePlanMember, PlanEnriched, PlanMemberEnriched, PlanWithMembers, UserWithPlans } from '@/types/plan.type';
import {
    mapPlanFromApi,
    mapPlanMemberEnrichedFromDetails,
    mapPlanWithMembersFromApi,
    mapUserWithPlansFromApi,
} from '../utils/apiMappers';
import { backendApi, ListPlansFilter } from '../utils/apiUtils';

export default function createPlanRepository() {
    const onePlanWithEnrichment = async (planId: string, memberCount = 0): Promise<PlanEnriched> => {
        const plan = await backendApi.getPlanById(planId);
        return mapPlanFromApi(plan, memberCount);
    }

    const listByUserId = async (userId: string): Promise<PlanEnriched[]> => {
        console.log("PlanRepository.listByUserId - userId:", userId);
        const { plans } = await getUserWithPlansByUserId(userId);
        return plans;
    }

    const list = async (filter?: ListPlansFilter): Promise<PlanEnriched[]> => {
        console.log("PlanRepository.list - filter:", filter);
        const plans = await backendApi.listPlans(filter);
        return Promise.all(plans.map(async (plan) => {
            const { users } = await getPlanWithMembersByPlanId(plan.id);
            return mapPlanFromApi(plan, users.length)
        }));
    };

    const listByPlanIds = async (planIds: string[]): Promise<PlanEnriched[]> => {
        console.log("PlanRepository.listByPlanIds - planIds:", planIds);
        const tasks = planIds.map(async planId => getById(planId));
        return Promise.all(tasks);
    };

    const getPlanWithMembersByPlanId = async (planId: string): Promise<PlanWithMembers> => {
        console.log("PlanRepository.getPlanWithMembersByPlanId - planId:", planId);
        const data = await backendApi.getPlanWithMembersByPlanId(planId);
        return mapPlanWithMembersFromApi(data);
    };

    const getUserWithPlansByUserId = async (userId: string): Promise<UserWithPlans> => {
        console.log("PlanRepository.getUserWithPlansByUserId - userId:", userId);
        const data = await backendApi.getUserWithPlansByUserId(userId);
        return mapUserWithPlansFromApi(data);
    };

    const getPlanMemberDetails = async (planId: string, userId: string): Promise<PlanMemberEnriched> => {
        console.log("PlanRepository.getPlanMemberDetails - planId:", planId, "userId:", userId);
        const data = await backendApi.getPlanMemberDetails(planId, userId);
        return mapPlanMemberEnrichedFromDetails(data);
    };

    const getById = async (id: string): Promise<PlanEnriched> => {
        console.log("PlanRepository.getById - id:", id);
        const { users } = await getPlanWithMembersByPlanId(id);
        return onePlanWithEnrichment(id, users.length);
    };

    const create = async (createPlan: CreatePlan): Promise<PlanEnriched> => {
        console.log("PlanRepository.create - createPlan:", createPlan);
        const planCreated = await backendApi.createPlan(createPlan);
        return mapPlanFromApi(planCreated, 0);
    };

    const join = async (createPlanMember: ManagePlanMember): Promise<PlanMemberEnriched> => {
        console.log("PlanRepository.join - createPlanMember:", createPlanMember);
        const planMemberCreated = await backendApi.joinPlan(createPlanMember.planId, createPlanMember.userId);
        return mapPlanMemberEnrichedFromDetails(planMemberCreated);
    };

    const leave = async (deletePlanMember: ManagePlanMember): Promise<void> => {
        console.log("PlanRepository.leave - deletePlanMember:", deletePlanMember);
        await backendApi.leavePlan(deletePlanMember.planId, deletePlanMember.userId);
    };

    const block = async (blockPlanMember: ManagePlanMember): Promise<PlanMemberEnriched> => {
        console.log("PlanRepository.block - blockPlanMember:", blockPlanMember);
        const planMemberUpdated = await backendApi.blockPlanMember(blockPlanMember.planId, blockPlanMember.userId);
        return mapPlanMemberEnrichedFromDetails(planMemberUpdated);
    };

    const unblock = async (unblockPlanMember: ManagePlanMember): Promise<void> => {
        console.log("PlanRepository.unblock - unblockPlanMember:", unblockPlanMember);
        await backendApi.unblockPlanMember(unblockPlanMember.planId, unblockPlanMember.userId);
    };

    return {
        list,
        getPlanWithMembersByPlanId,
        getUserWithPlansByUserId,
        getPlanMemberDetails,
        listByUserId,
        getById,
        create,
        join,
        leave,
        block,
        unblock,
    }
}
