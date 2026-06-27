
import { backendApi } from '@/src/utils/apiUtils';
import { toastErrorMessage } from '../utils/toastUtils';

type UploadFileProps = {
    filePath: string;
    fileName: string;
    fileType: string;
}

export default function createS3Repository() {
    const uploadFile = async (props: UploadFileProps): Promise<string> => {
        console.log("S3Repository.uploadFile - props:", props);
        try {
            const { uploadUrl, fileUrl } = await backendApi.getPresignedUploadUrl(
                props.fileName,
                props.fileType
            );

            const fileUri = props.filePath.startsWith('file://')
                ? props.filePath
                : `file://${props.filePath}`;

                console.log("S3Repository.uploadFile - fileUri:", fileUri);
            const fileResponse = await fetch(fileUri);
            const fileBlob = await fileResponse.blob();

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: fileBlob,
                headers: {
                    'Content-Type': props.fileType,
                },
            });

            if (!uploadResponse.ok)
                throw new Error(`Upload failed with status ${uploadResponse.status}`);

            return fileUrl;
        }
        catch (err) {
            toastErrorMessage("Erro ao enviar foto para o servidor");
            console.error(err);
            throw err;
        }
    };

    return {
        uploadFile,
    }
}
