import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankingService } from '@core/services/ranking.service';
import type { Professional } from '@core/models/professional.model';
import { Router } from '@angular/router';

@Component({
  selector: 'gm-ranking',
  imports: [CommonModule, FormsModule],
  templateUrl: './ranking-v2.html',
  styleUrl: './ranking-v2.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Ranking {
  private rankingService = inject(RankingService);
  private router = inject(Router);

  public professionals: Professional[] = [];
  public filteredProfessionals: Professional[] = [];
  public topThree: Professional[] = [];
  public rest: Professional[] = [];
  public topOne?: Professional;

  // filters
  public filterSpecialty: string = '';
  public filterCountry: string = '';
  public filterDepartment: string = '';
  public minExperience = 0;

  public specialties: string[] = [];
  public countries: string[] = [];
  public departments: string[] = [];
  public experienceMax = 0;

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    // Show local/cached data first for immediate display
    this.updateList();
    
    // Then fetch remote and update again
    try {
      await this.rankingService.fetchRemoteAll();
      this.updateList();
    } catch (e) {
      console.error('Error loading ranking:', e);
    }
  }

  public updateList(): void {
    const all = this.rankingService.getAll();
    this.professionals = all;

    const specSet = new Set<string>();
    const countrySet = new Set<string>();
    const deptSet = new Set<string>();
    let maxExp = 0;
    for (const p of all) {
      if (p.specialty) specSet.add(p.specialty);
      const c = (p as any).country;
      if (c) countrySet.add(c);
      const d = (p as any).department;
      if (d) deptSet.add(d);
      const y = (p as any).yearsOfExperience || 0;
      if (y > maxExp) maxExp = y;
    }

    this.specialties = Array.from(specSet).sort();
    this.countries = Array.from(countrySet).sort();
    this.departments = Array.from(deptSet).sort();
    this.experienceMax = maxExp;

    this.filteredProfessionals = all.filter((p) => {
      if (this.filterSpecialty && p.specialty !== this.filterSpecialty) return false;
      if (this.filterCountry && ((p as any).country || '') !== this.filterCountry) return false;
      if (this.filterDepartment && ((p as any).department || '') !== this.filterDepartment) return false;
      if (this.minExperience && ((p as any).yearsOfExperience || 0) < this.minExperience) return false;
      return true;
    });

    // We keep up to 10 for the main list
    this.topThree = this.filteredProfessionals.slice(0, 3);
    this.rest = this.filteredProfessionals.slice(3, 10);
    this.topOne = this.topThree[0];
  }

  protected avg(p: Professional): number {
    return this.rankingService.averageRating(p);
  }

  protected filledCount(p: Professional): number {
    return Math.round(this.avg(p));
  }

  protected positiveRate(p: Professional): number {
    const n = p.ratings.length;
    if (n === 0) return 0;
    const positives = p.ratings.filter((r) => r === 3).length;
    return positives / n;
  }

  protected positivePercent(p: Professional): number {
    return Math.round(this.positiveRate(p) * 100);
  }

  protected isRecommended(p: Professional): boolean {
    return this.positiveRate(p) >= 0.8 && p.ratings.length >= 3;
  }

  protected ratingCount(p: Professional, value: number): number {
    return p.ratings.filter((r) => r === value).length;
  }

  protected trackById(_: number, item: Professional) {
    return item.id;
  }

  // Demo-only: update local data and refresh lists
  public simulateRating(professionalId: number, rating: number) {
    this.rankingService.rate(professionalId, rating);
    this.updateList();
  }

  public viewProfile(p: Professional) {
    try {
      this.router.navigate(['/profile', p.id]);
    } catch (e) {
      // ignore
    }
  }

  public clearFilters() {
    this.filterSpecialty = '';
    this.filterCountry = '';
    this.filterDepartment = '';
    this.minExperience = 0;
    this.updateList();
  }
}
