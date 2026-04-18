export interface Professional {
  id: number;
  name: string;
  specialty?: string;
  photo?: string;
  ratings: number[]; // cada entrada es 1,2 o 3 corazones
  totalPatients?: number; // aproximado
  country?: string;
  department?: string;
  yearsOfExperience?: number;
}
