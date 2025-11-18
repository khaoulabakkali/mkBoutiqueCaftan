import { Injectable } from '@angular/core';
import { Observable, throwError, of, delay } from 'rxjs';
import { Taille } from '../models/taille.model';

@Injectable({
  providedIn: 'root'
})
export class TailleService {
  private readonly STORAGE_KEY = 'local_tailles';

  constructor() {
    // Initialiser le stockage local avec des données de démonstration si vide
    this.initializeLocalStorage();
  }

  /**
   * Initialise le stockage local avec des données de démonstration
   */
  private initializeLocalStorage(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const defaultTailles: Taille[] = [
        {
          id_taille: 1,
          taille: 'XS'
        },
        {
          id_taille: 2,
          taille: 'S'
        },
        {
          id_taille: 3,
          taille: 'M'
        },
        {
          id_taille: 4,
          taille: 'L'
        },
        {
          id_taille: 5,
          taille: 'XL'
        },
        {
          id_taille: 6,
          taille: 'XXL'
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultTailles));
    }
  }

  /**
   * Récupère toutes les tailles du stockage local
   */
  private getLocalTailles(): Taille[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde les tailles dans le stockage local
   */
  private saveLocalTailles(tailles: Taille[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tailles));
  }

  /**
   * Génère un nouvel ID pour une taille
   */
  private getNextId(): number {
    const tailles = this.getLocalTailles();
    if (tailles.length === 0) return 1;
    return Math.max(...tailles.map(t => t.id_taille || 0)) + 1;
  }

  /**
   * Récupérer toutes les tailles (local)
   */
  getAllTailles(): Observable<Taille[]> {
    const tailles = this.getLocalTailles();
    return of(tailles).pipe(delay(300));
  }

  /**
   * Récupérer une taille par ID (local)
   */
  getTailleById(id: number): Observable<Taille> {
    const tailles = this.getLocalTailles();
    const taille = tailles.find(t => t.id_taille === id);
    
    if (!taille) {
      return throwError(() => new Error(`Taille avec l'ID ${id} non trouvée`));
    }
    
    return of({ ...taille }).pipe(delay(200));
  }

  /**
   * Créer une nouvelle taille (local)
   */
  createTaille(taille: Taille): Observable<Taille> {
    const tailles = this.getLocalTailles();
    
    // Vérifier si la taille existe déjà (insensible à la casse)
    if (tailles.some(t => t.taille.toUpperCase() === taille.taille.toUpperCase())) {
      return throwError(() => new Error('Une taille avec ce libellé existe déjà'));
    }
    
    // Créer la nouvelle taille
    const newTaille: Taille = {
      ...taille,
      id_taille: this.getNextId(),
      taille: taille.taille.trim()
    };
    
    tailles.push(newTaille);
    this.saveLocalTailles(tailles);
    
    return of({ ...newTaille }).pipe(delay(300));
  }

  /**
   * Mettre à jour une taille (local)
   */
  updateTaille(id: number, taille: Taille): Observable<Taille> {
    const tailles = this.getLocalTailles();
    const index = tailles.findIndex(t => t.id_taille === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Taille avec l'ID ${id} non trouvée`));
    }
    
    // Vérifier si la taille existe déjà pour une autre taille
    const existingTaille = tailles.find(t => t.taille.toUpperCase() === taille.taille.toUpperCase() && t.id_taille !== id);
    if (existingTaille) {
      return throwError(() => new Error('Une taille avec ce libellé existe déjà'));
    }
    
    // Mettre à jour la taille
    const updatedTaille: Taille = {
      ...tailles[index],
      ...taille,
      id_taille: id, // S'assurer que l'ID ne change pas
      taille: taille.taille.trim()
    };
    
    tailles[index] = updatedTaille;
    this.saveLocalTailles(tailles);
    
    return of({ ...updatedTaille }).pipe(delay(300));
  }

  /**
   * Supprimer une taille (local)
   */
  deleteTaille(id: number): Observable<boolean> {
    const tailles = this.getLocalTailles();
    const index = tailles.findIndex(t => t.id_taille === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Taille avec l'ID ${id} non trouvée`));
    }
    
    tailles.splice(index, 1);
    this.saveLocalTailles(tailles);
    
    return of(true).pipe(delay(300));
  }
}

