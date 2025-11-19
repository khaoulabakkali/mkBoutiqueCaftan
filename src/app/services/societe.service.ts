import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Societe } from '../models/societe.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocieteService {
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
   * Récupérer toutes les sociétés
   */
  getAllSocietes(): Observable<Societe[]> {
    return this.http.get<Societe[]>(
      `${this.apiUrl}/societes`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Societe[]>('getAllSocietes', []))
    );
  }

  /**
   * Récupérer une société par ID
   */
  getSocieteById(id: number): Observable<Societe> {
    return this.http.get<Societe>(
      `${this.apiUrl}/societes/${id}`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Societe>('getSocieteById'))
    );
  }

  /**
   * Créer une nouvelle société
   */
  createSociete(societe: Societe): Observable<Societe> {
    const payload = {
      NomSociete: societe.nomSociete.trim(),
      Description: societe.description || undefined,
      Adresse: societe.adresse || undefined,
      Telephone: societe.telephone || undefined,
      Email: societe.email || undefined,
      SiteWeb: societe.siteWeb || undefined,
      Logo: societe.logo || undefined,
      Actif: societe.actif
    };

    return this.http.post<Societe>(
      `${this.apiUrl}/societes`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Societe>('createSociete'))
    );
  }

  /**
   * Mettre à jour une société
   */
  updateSociete(id: number, societe: Societe): Observable<Societe> {
    const payload = {
      NomSociete: societe.nomSociete.trim(),
      Description: societe.description || undefined,
      Adresse: societe.adresse || undefined,
      Telephone: societe.telephone || undefined,
      Email: societe.email || undefined,
      SiteWeb: societe.siteWeb || undefined,
      Logo: societe.logo || undefined,
      Actif: societe.actif
    };

    return this.http.put<Societe>(
      `${this.apiUrl}/societes/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Societe>('updateSociete'))
    );
  }

  /**
   * Supprimer une société
   */
  deleteSociete(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/societes/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deleteSociete', false))
    );
  }

  /**
   * Activer/Désactiver une société
   */
  toggleActif(id: number, actif: boolean): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/societes/${id}/actif`,
      { actif },
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('toggleActif', false))
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

