
import { CheckinEnriched, CheckinReview, CheckinStatus, CreateCheckin } from '@/types/checkin.type';
import { getDateOnly } from '../utils/dateUtils';
import { mapCheckInEnrichedFromApi } from '../utils/apiMappers';
import { backendApi, ListCheckInsFilter } from '../utils/apiUtils';

export default function createCheckinRepository() {
    const list = async (filter?: Partial<{ planId: string; userId: string; status: CheckinStatus; date: Date }>): Promise<CheckinEnriched[]> => {
        console.log("CheckinRepository.list - filter:", filter);
        const checkins = await backendApi.listCheckIns({
            planId: filter?.planId,
            userId: filter?.userId,
            status: filter?.status,
            date: filter?.date ? getDateOnly(filter.date) : undefined,
        } satisfies ListCheckInsFilter);
        return checkins.map(mapCheckInEnrichedFromApi);
    };

    const get = async (filter?: Partial<{ planId: string; userId: string; status: CheckinStatus; id: string }>): Promise<CheckinEnriched> => {
        console.log("CheckinRepository.get - filter:", filter);

        if (filter?.id)
            return getById(filter.id);

        const checkins = await list(filter);

        if (checkins.length === 0)
            throw new Error(`Checkin não encontrado para o filtro ${JSON.stringify(filter)}`);

        return checkins[0];
    };

    const getById = async (id: string): Promise<CheckinEnriched> => {
        console.log("CheckinRepository.getById - id:", id);
        const checkin = await backendApi.getCheckInById(id);
        return mapCheckInEnrichedFromApi(checkin);
    };

    const create = async (createCheckin: CreateCheckin): Promise<CheckinEnriched> => {
        console.log("CheckinRepository.create - createCheckin:", createCheckin);

        const checkinCreated = await backendApi.addCheckIn({
            ...createCheckin,
            date: getDateOnly(createCheckin.date),
        });
        return mapCheckInEnrichedFromApi(checkinCreated);
    };

    const saveReview = async (checkinId: string, checkinReview: CheckinReview): Promise<CheckinEnriched> => {
        console.log("CheckinRepository.saveReview - checkinId:", checkinId);
        console.log("CheckinRepository.saveReview - checkinReview:", checkinReview);

        const checkinUpdated = await backendApi.reviewCheckIn(checkinId, {
            reviewerId: checkinReview.reviewerId,
            status: checkinReview.status,
            date: new Date().toISOString(),
        });

        return mapCheckInEnrichedFromApi(checkinUpdated);
    };

    return {
        list,
        get,
        getById,
        create,
        saveReview
    }
}
