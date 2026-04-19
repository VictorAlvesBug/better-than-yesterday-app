import { z, ZodEnum } from "zod";
import { joinWithCommasAndOr } from "./stringUtils";

export function zodEnumWithValidation<TValues extends readonly string[]>(
    values: TValues, 
    fieldDescription: string
) {
    const strValues = joinWithCommasAndOr([...values]);
    return z.enum(
        values,
        { error: `${fieldDescription} deve ser ${strValues}` }
    );
}

export function zodExtractWithValidation<TValues extends readonly string[]>(
    baseSchema: ZodEnum<{
        [x: string]: string;
    }>, 
    values: TValues, 
    fieldDescription: string
) {
    const strValues = joinWithCommasAndOr([...values]);
    return baseSchema.extract(
        values,
        { error: `${fieldDescription} deve ser ${strValues}` }
    );
}