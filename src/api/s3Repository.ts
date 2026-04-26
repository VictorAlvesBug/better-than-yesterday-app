
import { API_URL } from '@/src/utils/constants';
import AWS from 'aws-sdk';
import axios from 'axios';
import { toastErrorMessage } from '../utils/toastUtils';

type UploadFileProps = {
    bucket: string;
    filePath: string;
    fileName: string;
    fileType: string;
}

type SettingsType = {
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
}

export default function createS3Repository() {

    const init = async () => {
        const response = await axios.get<SettingsType>(`${API_URL}/settings`);

        AWS.config.update({
            accessKeyId: response.data.awsAccessKeyId,
            secretAccessKey: response.data.awsSecretAccessKey,
            region: "sa-east"
        })
    };

    init();

    const uploadFile = async (props: UploadFileProps) => {
        try {
            const s3 = new AWS.S3();

            return s3.upload({
                Bucket: props.bucket,
                Key: props.fileName,
                Body: props.filePath
            }).promise();

        }
        catch (err) {
            toastErrorMessage("Erro ao recuperar URL Pré-assinada")
            console.error(err);
            return '';
        }
    };

    return {
        uploadFile,
    }
}