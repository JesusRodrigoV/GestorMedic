export interface Clinic {
  id: number;
  name: string;
  nit_ruc: string;
  address: string;
  phone: string;
  logo_url: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedClinics {
  items: Clinic[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ClinicPayload {
  name: string;
  nit_ruc: string;
  address: string;
  phone: string;
  logo_url: string;
  plan: string;
  is_active?: boolean;
}

export interface ClinicQueryParams {
  is_active?: boolean | null;
  page?: number;
  size?: number;
}