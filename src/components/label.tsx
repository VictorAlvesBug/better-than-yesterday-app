import { getColor } from '@/types/color.type';
import { TextSize } from '@/types/common.type';
import React from 'react';
import { Text } from 'react-native';

type LabelProps = {
    size?: TextSize;
    children: string;
};

export default function Label({ children, size = "text-base" }: LabelProps) {
    return (
        <Text style={{color: getColor("gray-7")}} className={`mb-1 font-semibold uppercase ${size}`}>
            {children}
        </Text>
    )
}
