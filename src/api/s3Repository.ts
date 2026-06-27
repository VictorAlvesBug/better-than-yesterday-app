
import { backendApi } from '@/src/utils/apiUtils';
import * as FileSystem from 'expo-file-system/legacy';

type UploadFileProps = {
    filePath: string;
    fileName: string;
    fileType: string;
}

export default function createS3Repository() {
    const uploadFile = async (props: UploadFileProps): Promise<string> => {
        const { uploadUrl, fileUrl } = await backendApi.getPresignedUploadUrl(
            props.fileName,
            props.fileType
        );

        const fileUri = props.filePath.startsWith('file://')
            ? props.filePath
            : `file://${props.filePath}`;

        const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
            httpMethod: 'PUT',
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers: {
                'Content-Type': props.fileType,
            },
        });

        if (uploadResult.status < 200 || uploadResult.status >= 300) {
            console.error('S3 upload failed:', uploadResult.status, uploadResult.body);
            throw new Error(`Upload failed with status ${uploadResult.status}: ${uploadResult.body}`);
        }

        return fileUrl;
    };

    return {
        uploadFile,
    }
}
