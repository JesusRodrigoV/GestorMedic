export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  experience: number;
  avatar: string;
  modality: 'presencial' | 'online' | 'ambas';
}
