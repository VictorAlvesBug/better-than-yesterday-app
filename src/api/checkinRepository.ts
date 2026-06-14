
import { Checkin, CheckinEnriched, CheckinReview, CreateCheckin } from '@/types/checkin.type';
import { api } from '../utils/apiUtils';
import createPlanRepository from './planRepository';
import createUserRepository from './userRepository';

export default function createCheckinRepository() {
    const userRepository = createUserRepository();
    const planRepository = createPlanRepository();

    const oneWithEnrichment = async (checkin: Checkin): Promise<CheckinEnriched> => {
        const plan = await planRepository.getById(checkin.planId);
        const user = await userRepository.getById(checkin.userId);

        return {
            ...checkin,
            planName: plan.description || plan.habitName,
            userName: user.nickname,
        } satisfies CheckinEnriched;
    }

    const manyWithEnrichment = async (checkins: Checkin[]): Promise<CheckinEnriched[]> => {
        const tasks = checkins.map(async checkin => oneWithEnrichment(checkin));
        return Promise.all(tasks);
    }

    const list = async (filter?: Partial<Checkin>): Promise<CheckinEnriched[]> => {
        console.log("CheckinRepository.list - filter:", filter);
        const checkins = await api.list('checkins', filter);
        return manyWithEnrichment(checkins);
    };

    const get = async (filter?: Partial<Checkin>): Promise<CheckinEnriched> => {
        console.log("CheckinRepository.get - filter:", filter);
        const checkin = await api.get('checkins', filter);

        if (!checkin)
            throw new Error(`Checkin não encontrado para o filtro ${JSON.stringify(filter)}`);

        return oneWithEnrichment(checkin);
    };

    const getById = async (id: string): Promise<CheckinEnriched> => {
        console.log("CheckinRepository.getById - id:", id);
        const checkin = await api.get('checkins', { id });

        if (!checkin)
            throw new Error(`Checkin não encontrado para o id '${id}'`);

        return oneWithEnrichment(checkin);
    };

    const create = async (createCheckin: CreateCheckin): Promise<CheckinEnriched> => {
        console.log("CheckinRepository.create - createCheckin:", createCheckin);

        const checkinCreated = await api.createWithBody('checkins', createCheckin);
        return oneWithEnrichment(checkinCreated);
    };

    const saveReview = async (checkinId: string, checkinReview: CheckinReview): Promise<CheckinEnriched> => {
        console.log("CheckinRepository.saveReview - checkinId:", checkinId);
        console.log("CheckinRepository.saveReview - checkinReview:", checkinReview);

        const checkin = await getById(checkinId) satisfies Checkin;

        checkin.reviews.push(checkinReview)

        await api.deleteWithFilter('checkins', {id: checkin.id});
        // TODO: Ajustar para ficar aderente ao contrato da API, que ainda não foi desenvolvido neste momento
        const checkinUpdated = await api.createWithBody('checkins', checkin);
        return oneWithEnrichment(checkinUpdated);
    };

    return {
        list,
        get,
        getById,
        create,
        saveReview
    }
}