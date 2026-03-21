//import { IntlNumberFormat } from '@formatjs/intl-numberformat/polyfill';

export function formatInteger(value: number) {
    return getIntegerFormatter({ value, showWholeNumber: false, useCompact: false })
        .format(value);
}

export function formatIntegerCompact(value: number) {
    return getIntegerFormatter({ value, showWholeNumber: false, useCompact: true })
        .format(value);
}

export function formatMoney(value: number) {
    const formatter = new Intl.NumberFormat(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL',
            notation: 'standard',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    return formatter.format(value);
}

export function formatMoneyCompact(value: number) {
    if (Math.abs(value) < 1000) {
        const formatter = new Intl.NumberFormat(
            'pt-BR',
            {
                style: 'currency',
                currency: 'BRL',
                notation: 'standard',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });

        return formatter.format(value);
    }

    const formatter = new Intl.NumberFormat(
        'en-US',
        {
            notation: 'compact',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        return `R$${formatter.format(value)}`;
}

export function formatPercent(value: number) {
    return getPercentFormatter({ value })
        .format(value);
}

export function formatPercentCompact(value: number) {
    return getPercentFormatter({ value, useCompact: true })
        .format(value);
}

type GetFormatterOptions = {
    value: number;
    showWholeNumber: boolean;
    useCompact?: boolean;
}

function getIntegerFormatter({ value, showWholeNumber, useCompact }: GetFormatterOptions) {
    const absoluteValue = Math.abs(value);
    const decimalPlaces = showWholeNumber ? 2 : 0;
    const notationDueToUseCompact = useCompact === undefined ? undefined : (useCompact ? 'compact' : 'standard');
    const locateDueToUseCompact = useCompact === undefined ? undefined : (useCompact ? 'en-US' : 'pt-BR');

    if (absoluteValue < 1000 || showWholeNumber) {
        return new Intl.NumberFormat(
            locateDueToUseCompact ?? 'pt-BR',
            {
                notation: notationDueToUseCompact ?? 'standard',
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces
            });
    }

    return new Intl.NumberFormat(
        locateDueToUseCompact ?? 'en-US',
        {
            notation: notationDueToUseCompact ?? 'compact',
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        });
}

type GetPercentFormatterOptions = {
    value: number;
    useCompact?: boolean;
}

function getPercentFormatter({ value, useCompact }: GetPercentFormatterOptions) {
    const hasDecimalPlaces = (100 * Math.abs(value)) % 1 > 0;
    const notationDueToUseCompact = useCompact === undefined ? undefined : (useCompact ? 'compact' : 'standard');
    const locateDueToUseCompact = useCompact === undefined ? undefined : (useCompact ? 'en-US' : 'pt-BR');
    const decimalPlacesDueToUseCompact = useCompact === undefined ? undefined : (useCompact ? 0 : 2);

    if (hasDecimalPlaces) {
        return new Intl.NumberFormat(
            locateDueToUseCompact ?? 'pt-BR',
            {
                style: 'percent',
                notation: notationDueToUseCompact ?? 'standard',
                minimumFractionDigits: decimalPlacesDueToUseCompact ?? 2,
                maximumFractionDigits: decimalPlacesDueToUseCompact ?? 2
            });
    }

    return new Intl.NumberFormat(
        locateDueToUseCompact ?? 'en-US',
        {
            style: 'percent',
            notation: notationDueToUseCompact ?? 'compact',
            minimumFractionDigits: decimalPlacesDueToUseCompact ?? 0,
            maximumFractionDigits: decimalPlacesDueToUseCompact ?? 0
        });
}