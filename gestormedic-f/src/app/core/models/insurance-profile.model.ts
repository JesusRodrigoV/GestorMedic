export interface InsuranceProfile {
  id: number;
  user_id: number;
  company_name: string;
  tax_id: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  office_address: string;
}

export interface UpdateInsuranceProfilePayload {
  company_name: string;
  tax_id: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  office_address: string;
}