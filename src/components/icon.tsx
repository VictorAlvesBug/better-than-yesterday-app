import { ColorName, getColor } from '@/types/color.type';
import { Feather, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import React from 'react';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type FontAwesomeName = React.ComponentProps<typeof FontAwesome>['name'];
type MaterialIconsName = React.ComponentProps<typeof MaterialIcons>['name'];
type OcticonsName = React.ComponentProps<typeof Octicons>['name'];
type FeatherName = React.ComponentProps<typeof Feather>['name'];

type IconProps = {
    size?: number;
    color?: ColorName;
} & ({
    type: 'ionicons';
    name: IoniconsName;
} | {
    type: 'font-awesome';
    name: FontAwesomeName;
} | {
    type: 'font-awesome-5' | 'font-awesome-6';
    name: string;
} | {
    type: 'material';
    name: MaterialIconsName;
} | {
    type: 'octicons';
    name: OcticonsName;
} | {
    type: 'feather';
    name: FeatherName;
} | {
    type?: never;
    name: 
        | IoniconsName
        | FontAwesomeName
        | MaterialIconsName
        | OcticonsName
        | FeatherName;
}) & Omit<(
    React.ComponentProps<typeof Ionicons>
    | React.ComponentProps<typeof FontAwesome>
    | React.ComponentProps<typeof FontAwesome5>
    | React.ComponentProps<typeof FontAwesome6>
    | React.ComponentProps<typeof MaterialIcons>
    | React.ComponentProps<typeof Octicons>
    | React.ComponentProps<typeof Feather>
), 'name' | 'color' | 'size'>;

export default function Icon({
    type,
    color = 'gray-7',
    name,
    size = 18,
    ...rest
}: IconProps) {
    const IconComponent = getIconComponent(type, name);

    return (
        <IconComponent {...rest} name={name} size={size ?? 18} color={getColor(color)} />
    )
}


function getIconComponent(type: IconProps['type'], name: IconProps['name']) {
    switch (type) {
        case 'ionicons':
            return Ionicons;
        case 'font-awesome':
            return FontAwesome;
        case 'font-awesome-5':
            return FontAwesome5;
        case 'font-awesome-6':
            return FontAwesome6;
        case 'material':
            return MaterialIcons;
        case 'octicons':
            return Octicons;
        case 'feather':
            return Feather;
        default:
            return GuessIcon(name);
    }
}

function GuessIcon<TIconName extends IconProps['name']>(name: TIconName) {
    if (name in Ionicons.glyphMap) {
        return Ionicons;
    }
    if (name in FontAwesome.glyphMap) {
        return FontAwesome;
    }
    if (name in MaterialIcons.glyphMap) {
        return MaterialIcons;
    }
    if (name in Octicons.glyphMap) {
        return Octicons;
    }
    if (name in Feather.glyphMap) {
        return Feather;
    }

    return FontAwesome5;
}