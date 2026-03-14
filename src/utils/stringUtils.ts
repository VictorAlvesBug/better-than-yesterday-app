export function toCapitalize(text: string) {
    if (text === null || text === undefined)
        throw new Error(`Texto inválido (${text})`);

    return text
        .split('')
        .map((char, index) =>
            index === 0
                ? char.toUpperCase()
                : char.toLowerCase())
        .join('');
}

export function getInitials(text: string) {
    if (text === null || text === undefined)
        throw new Error(`Texto inválido (${text})`);

    const allInitials = text
        .split(' ')
        .map((textPart) => textPart[0].toUpperCase());

    switch (allInitials.length) {
        case 0:
        case 1:
        case 2:
            return allInitials.join('');
        default:
            return `${allInitials.at(0)}${allInitials.at(-1)}`;
    }
}