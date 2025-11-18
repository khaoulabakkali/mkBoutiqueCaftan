import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Categorie } from '../models/categorie.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Récupère les options HTTP avec le token d'authentification
   */
  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return { headers };
  }

  /**
   * Récupérer toutes les catégories
   */
  getAllCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(
      `${this.apiUrl}/categories`,
      this.getHttpOptions()
    ).pipe(
      map(categories => {
        // Trier par ordreAffichage si défini
        return [...categories].sort((a, b) => {
          const ordreA = a.ordreAffichage ?? 999;
          const ordreB = b.ordreAffichage ?? 999;
          return ordreA - ordreB;
        });
      }),
      catchError(this.handleError<Categorie[]>('getAllCategories', []))
    );
  }

  /**
   * Récupérer une catégorie par ID
   */
  getCategorieById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(
      `${this.apiUrl}/categories/${id}`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Categorie>('getCategorieById'))
    );
  }

  /**
   * Créer une nouvelle catégorie
   */
  createCategorie(categorie: Categorie): Observable<Categorie> {
    const payload = {
      nomCategorie: categorie.nomCategorie.trim(),
      description: categorie.description || undefined,
      ordreAffichage: categorie.ordreAffichage || undefined
    };

    return this.http.post<Categorie>(
      `${this.apiUrl}/categories`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Categorie>('createCategorie'))
    );
  }

  /**
   * Mettre à jour une catégorie
   */
  updateCategorie(id: number, categorie: Categorie): Observable<Categorie> {
    const payload = {
      nomCategorie: categorie.nomCategorie.trim(),
      description: categorie.description || undefined,
      ordreAffichage: categorie.ordreAffichage || undefined
    };

    return this.http.put<Categorie>(
      `${this.apiUrl}/categories/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Categorie>('updateCategorie'))
    );
  }

  /**
   * Supprimer une catégorie
   */
  deleteCategorie(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/categories/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deleteCategorie', false))
    );
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      if (!environment.production) {
        console.error(`${operation} failed:`, error);
      }
      
      const errorMessage = this.extractErrorMessage(error);
      return throwError(() => new Error(errorMessage));
    };
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Erreur: ${error.error.message}`;
    }

    const statusMessages: { [key: number]: string } = {
      401: 'Non autorisé. Veuillez vous reconnecter.',
      403: 'Accès interdit.',
      404: 'Ressource non trouvée.',
      500: 'Erreur serveur. Veuillez réessayer plus tard.'
    };

    if (error.status && statusMessages[error.status]) {
      return statusMessages[error.status];
    }

    if (error.error) {
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.error) {
        return error.error.error;
      }
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (Array.isArray(error.error.errors)) {
        return error.error.errors.map((e: any) => e.message || e).join(', ');
      }
    }

    return 'Une erreur est survenue';
  }
}
