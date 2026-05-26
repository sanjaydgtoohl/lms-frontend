
import { apiClient } from '../utils/apiClient';

// Update Miss Campaign API
// Accepts id and formData (FormData or Record<string, string | Blob | undefined | null>)

export const updateMissCampaign = async (
  id: string | number,
  formData: Record<string, any> | FormData
): Promise<any> => {
  let data: FormData;
  if (formData instanceof FormData) {
    data = formData;
  } else {
    data = new FormData();
    // Only append fields that are not undefined/null
    if (formData.name !== undefined) data.append('name', String(formData.name));
    if (formData.brand_id !== undefined) data.append('brand_id', String(formData.brand_id));
    if (formData.lead_source_id !== undefined) data.append('lead_source_id', String(formData.lead_source_id));
    if (formData.lead_sub_source_id !== undefined) data.append('lead_sub_source_id', String(formData.lead_sub_source_id));
    if (formData.image_path instanceof Blob) data.append('image_path', formData.image_path);
    if (formData.remove_image) data.append('remove_image', '1');
    // Add any other fields as needed
  }
  data.append('_method', 'PUT');
  return apiClient.post(`/miss-campaigns/${id}`, data);
};
