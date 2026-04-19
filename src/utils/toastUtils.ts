import Toast, { ToastType } from "react-native-toast-message";
import { z } from "zod";

export function checkIfIsValidAndToast<
    TSchema extends z.ZodType
>(
    schema: TSchema,
    data: z.input<TSchema>
): boolean {
    const validation = schema.safeParse(data);

    if (validation.success)
        return true;

    const errors = JSON.parse(validation.error.message) as { message: string }[];
    const message = errors.map(err => err.message).join('\n');
    // TODO: refatorar para exibir mais de uma mensagem por vez
    toastMessage("error", message ?? "Dados inválidos", "Erro");
    return false;
}

export function toastErrorMessage(message: string) {
    toastMessage('error', message, "Ops");
}

export function toastSuccessMessage(message: string) {
    toastMessage('success', message, "Sucesso");
}

export function toastInfoMessage(message: string) {
    toastMessage('info', message, "Informação");
}

function toastMessage(type: ToastType, message: string, title: string) {
    Toast.show({
        type,
        text1: title,
        text2: message
    });
}