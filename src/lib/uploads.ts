import api from './api';
import { prepareNationalIdCardImage, prepareProfileImage, prepareUploadImage } from './image-compress';

export interface UploadImageResponse {
  url: string;
}

export const uploadsApi = {
  uploadNationalIdCard: async (file: File) => {
    const prepared = await prepareNationalIdCardImage(file);
    const formData = new FormData();
    formData.append('file', prepared);

    const response = await api.post<UploadImageResponse>(
      '/uploads/national-id-card',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return response.data;
  },

  uploadMawkibImage: async (file: File) => {
    const prepared = await prepareUploadImage(file);
    const formData = new FormData();
    formData.append('file', prepared);

    const response = await api.post<UploadImageResponse>(
      '/uploads/mawkib-image',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return response.data;
  },

  uploadProfileImage: async (file: File) => {
    const prepared = await prepareProfileImage(file);
    const formData = new FormData();
    formData.append('file', prepared);

    const response = await api.post<UploadImageResponse>(
      '/uploads/profile-image',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return response.data;
  },
};
