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
  private citasApiUrl = environment.apiUrl.replace('/api/v1', '/citas/api/v1');

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.professionals = JSON.parse(saved);
      } catch (_e) {
        this.professionals = [];
        this.save();
      }
    } else {
      this.professionals = [];
      this.save();
    }
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

  // Fetch ranking from backend and update local cache without hardcoded seed data.
  async fetchRemoteAll(filters: { specialty_id?: number; min_experience?: number; page?: number; page_size?: number } = {}): Promise<Professional[]> {
    try {
      const rankingResp = await lastValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/top-doctors`, {
          params: {
            limit: filters.page_size ?? 50,
          },
          withCredentials: true,
        }),
      );

      if (rankingResp && Array.isArray(rankingResp)) {
        this.professionals = rankingResp.map((item) => {
          const total = Number(item.total_ratings) || 0;
          const avg = Number(item.average_score) || 0;

          const ratings: number[] = [];
          const positiveCount = Math.max(0, Math.min(total, Math.round((avg / 5) * total)));
          for (let i = 0; i < positiveCount; i++) ratings.push(3);
          for (let i = positiveCount; i < total; i++) ratings.push(1);

          return {
            id: item.doctor_id,
            name: item.doctor_name || `Doctor #${item.doctor_id}`,
            specialty: (item.specialties && item.specialties[0]) || 'Especialidad no disponible',
            photo: item.photo || `https://i.pravatar.cc/150?u=doctor-${item.doctor_id}`,
            ratings,
            totalPatients: total,
            yearsOfExperience: item.experience_years || 0,
          } as Professional;
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
