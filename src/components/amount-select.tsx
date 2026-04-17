import React from 'react';
import {
    Pressable,
    View
} from 'react-native';
import { twMerge } from 'tailwind-merge';
import Icon from './icon';

type AmountSelectProps = {
    value: number;
    setValue?: (value: number) => void;
    minValue: number;
    maxValue: number;
    selectedIcon: React.ComponentProps<typeof Icon>;
    nonSelectedIcon: React.ComponentProps<typeof Icon>;
    disabled?: boolean;
} & React.ComponentProps<typeof View>;

export default function AmountSelect({
    value,
    setValue = () => { },
    className = '',
    minValue,
    maxValue,
    selectedIcon,
    nonSelectedIcon,
    disabled = false,
    ...rest
}: AmountSelectProps) {
    return (
        <View className={twMerge("flex flex-row items-center justify-evenly px-3", className)}
            {...rest}>
            {
                Array.from({ length: maxValue }).map((_, index) => {
                    const itemValue = index + 1;
                    const isSelected = itemValue <= value;

                    const greatestSize = Math.max(selectedIcon.size ?? 18, nonSelectedIcon.size ?? 18);

                    const wrapperSize = greatestSize / 18 * 22;

                    return (<Pressable
                        key={index}
                        disabled={disabled}
                        style={{
                            width: wrapperSize,
                            height: wrapperSize,
                        }}
                        className='flex items-center justify-center flex-1'
                        onPress={() => minValue <= itemValue && setValue(itemValue)}>
                        {isSelected ? (
                            <Icon {...selectedIcon} />
                        ) : (
                            <Icon {...nonSelectedIcon} />
                        )}
                    </Pressable>)
                })
            }
        </View>
    );
}