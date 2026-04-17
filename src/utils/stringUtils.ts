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
    if (!text)
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

export function getAbbreviatedName(name: string): string {
    const [givenName,] = name.split(' ');

    let familyNameInitials = getInitials(name).substring(1).split('').map(n => `${n}.`).join(' ');
    familyNameInitials = familyNameInitials ? ` ${familyNameInitials}` : '';

    return `${givenName}${familyNameInitials}`
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}