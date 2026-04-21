import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type { Professional } from '@core/models/professional.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private storageKey = 'gm:professionals:v1';
  private professionals: Professional[] = [];
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.replace('/api/v1', '/ranking/api/v1');

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.professionals = JSON.parse(saved);
      } catch (_e) {
        this.professionals = this.seed();
        this.save();
      }
    } else {
      this.professionals = this.seed();
      this.save();
    }
  }

  private seed(): Professional[] {
    return [
      {
        id: 1,
        name: 'Dra. Ana López',
        specialty: 'Cardiología',
        photo: 'https://i.pravatar.cc/150?img=12',
        ratings: [3, 3, 3, 2, 3, 3, 3],
        totalPatients: 120,
        country: 'Colombia',
        department: 'Bogotá',
        yearsOfExperience: 12,
      },
      {
        id: 2,
        name: 'Dr. Miguel Torres',
        specialty: 'Medicina General',
        photo: 'https://i.pravatar.cc/150?img=5',
        ratings: [1, 1, 1, 1, 1, 1, 1, 1, 1],
        totalPatients: 200,
        country: 'México',
        department: 'Ciudad de México',
        yearsOfExperience: 15,
      },
      {
        id: 3,
        name: 'Dra. Carla Gómez',
        specialty: 'Pediatría',
        photo: 'https://i.pravatar.cc/150?img=20',
        ratings: [3, 3, 3, 3, 3],
        totalPatients: 5,
        country: 'Perú',
        department: 'Lima',
        yearsOfExperience: 4,
      },
      {
        id: 4,
        name: 'Dr. Jorge Ruiz',
        specialty: 'Dermatología',
        photo: 'https://i.pravatar.cc/150?img=8',
        ratings: [2, 2, 3, 2],
        totalPatients: 40,
        country: 'Chile',
        department: 'Santiago',
        yearsOfExperience: 8,
      },
      {
        id: 5,
        name: 'Dra. Isabel Martínez',
        specialty: 'Ginecología',
        photo: 'https://i.pravatar.cc/150?img=18',
        ratings: [3],
        totalPatients: 1,
        country: 'Argentina',
        department: 'Buenos Aires',
        yearsOfExperience: 1,
      },
    ];
  }

  private save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.professionals));
    } catch (_e) {
      // ignore storage errors in demo mode
    }
  }

  getAll(): Professional[] {
    // return a sorted copy (desc) by confidence-adjusted positive-rate (Wilson score for 3-heart proportion)
    return this.professionals
      .map((p) => ({ ...p }))
      .sort((a, b) => this.score(b) - this.score(a));
  }

  averageRating(p: Professional): number {
    const n = p.ratings.length;
    if (n === 0) return 0;
    return p.ratings.reduce((s, r) => s + r, 0) / n;
  }

  // Wilson score lower bound for p = (# of 3-heart ratings) / n
  private score(p: Professional): number {
    const n = p.ratings.length;
    if (n === 0) return 0;
    const positives = p.ratings.filter((r) => r === 3).length;
    const phat = positives / n;
    const z = 1.96; // 95% confidence
    const denom = 1 + (z * z) / n;
    const numerator =
      phat + (z * z) / (2 * n) - z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n);
    return numerator / denom;
  }

  // Demo-only: rate locally (no backend integration). rating must be 1..3
  rate(id: number, rating: number) {
    const p = this.professionals.find((x) => x.id === id);
    if (!p) return;
    if (rating < 1 || rating > 3) return;
    p.ratings.push(rating);
    this.save();
  }

  // Fetch ranking from backend and update local scores.
  async fetchRemoteAll(filters: { specialty_id?: number; min_experience?: number; page?: number; page_size?: number } = {}): Promise<Professional[]> {
    try {
      const resp = await lastValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/top-doctors`, {
          withCredentials: true,
        }),
      );

      // Update our local seed/storage with real scores from the microservice
      if (resp && Array.isArray(resp)) {
        resp.forEach(item => {
          const pro = this.professionals.find(p => p.id === item.doctor_id);
          if (pro) {
            // Convert score (1-5) to our internal 1-3 heart representation if needed, 
            // or just map it directly. Here we'll just store the count to show it's "connected"
            const total = item.total_ratings || 0;
            const avg = item.average_score || 0;
            
            // Re-generate a representative ratings array for our Wilson formula
            const ratings: number[] = [];
            const positiveCount = Math.round((avg / 5) * total); // approximation
            for(let i=0; i<positiveCount; i++) ratings.push(3);
            for(let i=positiveCount; i<total; i++) ratings.push(1);
            
            pro.ratings = ratings;
            pro.totalPatients = total;
          }
        });
        this.save();
      }
      
      return this.getAll();
    } catch (_e) {
      console.error('Error fetching remote ranking', _e);
      return this.getAll();
    }
  }
}
