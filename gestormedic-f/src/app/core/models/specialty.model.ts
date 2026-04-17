export interface Specialty {
  id: number;
  name: string;
  description: string;
}

export interface PaginatedSpecialties {
  items: Specialty[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface SpecialtyPayload {
  name: string;
  description: string;
}

export interface SpecialtyQueryParams {
  search?: string | null;
  page?: number;
  size?: number;
}
