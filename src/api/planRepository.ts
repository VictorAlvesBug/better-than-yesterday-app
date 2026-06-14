
import { CreatePlan, ManagePlanMember, Plan, PlanEnriched, PlanMember, PlanMemberEnriched, PlanWithMembers, UserWithPlans } from '@/types/plan.type';
import axios from 'axios';
import { api, ApiResponse, isSuccessfulStatusCode, logError } from '../utils/apiUtils';
import { API_URL } from '../utils/constants';
import createHabitRepository from './habitRepository';
import createUserRepository from './userRepository';

export default function createPlanRepository() {
    const habitRepository = createHabitRepository();
    const userRepository = createUserRepository();

    /*const getPlanStatus = (plan: Plan): PlanStatus => {
        console.log("getPlanStatus - plan:", plan);
        if (plan.isCancelled)
            return 'Cancelled';

        const today = new Date();

        if (getDate(plan.endsAt) < today)
            return 'Finished';

        if (getDate(plan.startsAt) > today)
            return 'NotStarted';

        return 'Running';
    }*/

    const onePlanWithEnrichment = async (plan: Plan): Promise<PlanEnriched> => {
        const habit = await habitRepository.getById(plan.habitId);
        const owner = await userRepository.getById(plan.ownerId);

        const { users } = await getPlanWithMembersByPlanId(plan.id);

        if (!habit)
            throw new Error("Habit not found...");

        if (!owner)
            throw new Error("Owner not found...");

        return {
            ...plan,
            habitName: habit.name,
            ownerName: owner.nickname,
            memberCount: users.length,
        } satisfies PlanEnriched;
    }

    const manyPlansWithEnrichment = async (plans: Plan[]): Promise<PlanEnriched[]> => {
        const tasks = plans.map(async plan => onePlanWithEnrichment(plan));
        return Promise.all(tasks);
    }

    const onePlanMemberWithEnrichment = async (planMember: PlanMember): Promise<PlanMemberEnriched> => {
        const plan = await getById(planMember.planId);
        const user = await userRepository.getById(planMember.userId);

        return {
            ...planMember,
            user,
            plan
        } satisfies PlanMemberEnriched;
    }

    const manyPlanMembersWithEnrichment = async (planMembers: PlanMember[]): Promise<PlanMemberEnriched[]> => {
        const tasks = planMembers.map(async planMember => onePlanMemberWithEnrichment(planMember));
        return Promise.all(tasks);
    }

    const listByUserId = async (userId: string): Promise<PlanEnriched[]> => {
        console.log("PlanRepository.listByUserId - userId:", userId);
        const { plans } = await getUserWithPlansByUserId(userId);
        const planIds = plans.map(plan => plan.id);
        return listByPlanIds(planIds);
    }

    const list = async (filter?: Partial<Plan>): Promise<PlanEnriched[]> => {
        console.log("PlanRepository.list - filter:", filter);
        const plans = await api.list('plans', filter);
        return manyPlansWithEnrichment(plans);
    };

    const listByPlanIds = async (planIds: string[]): Promise<PlanEnriched[]> => {
        console.log("PlanRepository.listByPlanIds - planIds:", planIds);
        const tasks = planIds.map(async planId => {
            return await getById(planId);
        })
        return Promise.all(tasks);
    };

    const getPlanWithMembersByPlanId = async (planId: string): Promise<PlanWithMembers> => {        
        try {
            console.log("PlanRepository.getPlanWithMembersByPlanId - planId:", planId);
            const fullUrl = `${API_URL}/Plans/${planId}/Members`;
            console.log({ fullUrl });
            const response = await axios.get<ApiResponse<PlanWithMembers>>(fullUrl);
            console.log({ response });

            if (isSuccessfulStatusCode(response.status))
                return response.data.data;

            throw new Error(`Status Code ${response.status}: '${response}'`);
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    const getUserWithPlansByUserId = async (userId: string): Promise<UserWithPlans> => {
        try {
            console.log("PlanRepository.getUserWithPlansByUserId - userId:", userId);
            const fullUrl = `${API_URL}/Users/${userId}/Plans`;
            console.log({ fullUrl });
            const response = await axios.get<ApiResponse<UserWithPlans>>(fullUrl);
            console.log({ response });

            if (isSuccessfulStatusCode(response.status))
                return response.data.data;

            throw new Error(`Status Code ${response.status}: '${response}'`);
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    const getPlanMemberDetails = async (planId: string, userId: string): Promise<PlanMemberEnriched> => {        
        try {
            console.log("PlanRepository.getPlanMemberDetails - planId:", planId, "userId:", userId);
            const fullUrl = `${API_URL}/Plans/${planId}/Members/${userId}`;
            console.log({ fullUrl });
            const response = await axios.get<ApiResponse<PlanMemberEnriched>>(fullUrl);
            console.log({ response });

            if (isSuccessfulStatusCode(response.status))
                return response.data.data;

            throw new Error(`Status Code ${response.status}: '${response}'`);
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    /*const listPlanMembers = async (filter?: Partial<PlanMember>): Promise<PlanMember[]> => {
        console.log("PlanRepository.listPlanMembers - filter:", filter);
        return await api.list('planMembers', filter);
    };*/

    const getById = async (id: string): Promise<PlanEnriched> => {
        console.log("PlanRepository.getById - id:", id);
        const plan = await api.get('plans', { id });

        if (!plan)
            throw new Error(`Plano não encontrado para o id '${id}'`);

        return onePlanWithEnrichment(plan);
    };

    const create = async (createPlan: CreatePlan): Promise<PlanEnriched> => {
        console.log("PlanRepository.create - createPlan:", createPlan);
        // TODO: Adicionar na API para receber os campos DaysOffPerWeek e PenaltyValue
        const planCreated = await api.createWithBody('plans', createPlan);
        return onePlanWithEnrichment(planCreated);
    };

    const join = async (createPlanMember: ManagePlanMember): Promise<PlanMemberEnriched> => {
        console.log("PlanRepository.join - createPlanMember:", createPlanMember);
        const planMemberCreated = await api.createWithPath(
            'planMembers',
            `${createPlanMember.planId}/Members/${createPlanMember.userId}`
        );
        return onePlanMemberWithEnrichment(planMemberCreated);
    };

    const leave = async (deletePlanMember: ManagePlanMember): Promise<void> => {
        console.log("PlanRepository.leave - deletePlanMember:", deletePlanMember);
        await api.deleteWithPath(
            'planMembers',
            `${deletePlanMember.planId}/Members/${deletePlanMember.userId}`
        );
    };

    const block = async (blockPlanMember: ManagePlanMember): Promise<PlanMemberEnriched> => {
        console.log("PlanRepository.block - blockPlanMember:", blockPlanMember);
        const planMemberUpdated = await api.createWithPath(
            'planMembers',
            `${blockPlanMember.planId}/Members/${blockPlanMember.userId}/Block`
        );
        return onePlanMemberWithEnrichment(planMemberUpdated);
    };

    const unblock = async (unblockPlanMember: ManagePlanMember): Promise<void> => {
        console.log("PlanRepository.unblock - unblockPlanMember:", unblockPlanMember);
        // TODO: Ajustar para retornar o PlanMember atualizado e não void
        /*const planMemberUpdated = */await api.deleteWithPath(
            'planMembers',
            `${unblockPlanMember.planId}/Members/${unblockPlanMember.userId}/Block`
        );
        //return onePlanMemberWithEnrichment(planMemberUpdated);
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