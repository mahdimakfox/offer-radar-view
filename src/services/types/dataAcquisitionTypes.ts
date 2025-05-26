
export interface ApiMapping {
  id: string;
  provider_name: string;
  api_url: string;
  api_type: string;
  auth_required: boolean;
  data_mapping?: any;
}
