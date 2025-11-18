import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Taille } from '../models/taille.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TailleService {
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
   * Récupérer toutes les tailles
   */
  getAllTailles(): Observable<Taille[]> {
    return this.http.get<Taille[]>(
      `${this.apiUrl}/tailles`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Taille[]>('getAllTailles', []))
    );
  }

  /**
   * Récupérer une taille par ID
   */
  getTailleById(id: number): Observable<Taille> {
    return this.http.get<Taille>(
      `${this.apiUrl}/tailles/${id}`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Taille>('getTailleById'))
    );
  }

  /**
   * Créer une nouvelle taille
   */
  createTaille(taille: Taille): Observable<Taille> {
    const payload = {
      taille: taille.taille.trim()
    };

    return this.http.post<Taille>(
      `${this.apiUrl}/tailles`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Taille>('createTaille'))
    );
  }

  /**
   * Mettre à jour une taille
   */
  updateTaille(id: number, taille: Taille): Observable<Taille> {
    const payload = {
      taille: taille.taille.trim()
    };

    return this.http.put<Taille>(
      `${this.apiUrl}/tailles/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Taille>('updateTaille'))
    );
  }

  /**
   * Supprimer une taille
   */
  deleteTaille(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/tailles/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deleteTaille', false))
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
