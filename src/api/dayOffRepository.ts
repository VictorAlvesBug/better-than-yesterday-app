import { getDateOnly } from '../utils/dateUtils';
import { backendApi } from '../utils/apiUtils';

export default function createDayOffRepository() {
    const useDayOff = async (params: { planId: string; userId: string; date: Date }): Promise<number> => {
        const result = await backendApi.useDayOff(
            params.planId,
            params.userId,
            getDateOnly(params.date)
        );
        return result.daysOffAvailable;
    };

    const getAvailability = async (planId: string, userId: string): Promise<number> => {
        return backendApi.getDayOffAvailability(planId, userId);
    };

    return { useDayOff, getAvailability };
}
