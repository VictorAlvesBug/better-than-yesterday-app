import { getColor } from '@/types/color.type'
import React from 'react'
import { Text, View } from 'react-native'
import { formatInteger } from '../utils/numberUtils'
import { Button } from './button'
import Icon from './icon'

type DaysOffCardProps = {
    onUseDayOff?: () => void;
    daysOffAvailable: number;
}

export default function DaysOffCard({
    onUseDayOff,
    daysOffAvailable
}: DaysOffCardProps) {
    const anyDayOffIsAvailable = daysOffAvailable > 0;

    const singularOrPlularTitle = `${formatInteger(daysOffAvailable)} ${daysOffAvailable === 1 ? 'folga disponível' : 'folgas disponíveis'}`;

    const baseColor = anyDayOffIsAvailable ? 'success' : 'secondary';
    const title = anyDayOffIsAvailable ? singularOrPlularTitle : 'Nenhuma folga disponível';
    const complement = anyDayOffIsAvailable ? 'Use com sabedoria!' : 'Mantenha o foco e aguente firme!';

    return (
        <View
            style={{ backgroundColor: getColor(`light-${baseColor}`), borderColor: getColor(baseColor) }}
            className="flex flex-row items-center justify-center flex-1 w-full gap-4 px-4 py-2 border shadow-md rounded-xl">
            {anyDayOffIsAvailable
                && <Icon type="font-awesome-6" name="gift" size={20} color={"success"} />}
            <View className="flex flex-col items-start justify-center flex-1">
                <Text style={{ color: getColor(baseColor) }} className="text-base font-semibold">
                    {title}
                </Text>
                <Text style={{ color: getColor(baseColor) }} className="text-sm">{complement}</Text>
            </View>
            {anyDayOffIsAvailable
                && <Button 
                    color="success" 
                    textSize='text-base' 
                    className="h-auto px-4 py-2 rounded-xl"
                    action={onUseDayOff}>Usar</Button>}
        </View>
    )
}
