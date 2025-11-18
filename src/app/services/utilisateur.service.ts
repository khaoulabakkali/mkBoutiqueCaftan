import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, delay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Utilisateur, Role } from '../models/utilisateur.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';
  private readonly STORAGE_KEY = 'local_utilisateurs';

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
   * Récupérer tous les utilisateurs
   */
  getAllUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(
      `${this.apiUrl}/users`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Utilisateur[]>('getAllUtilisateurs', []))
    );
  }

  /**
   * Récupérer un utilisateur par ID
   */
  getUtilisateurById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(
      `${this.apiUrl}/users/${id}`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Utilisateur>('getUtilisateurById'))
    );
  }

  /**
   * Créer un nouvel utilisateur
   */
  createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
    // Préparer les données pour l'API (exclure mot_de_passe_hash si présent)
    const { mot_de_passe_hash, ...userData } = utilisateur;
    const payload = {
      ...userData,
      mot_de_passe: utilisateur.mot_de_passe // Le backend devrait hasher le mot de passe
    };

    return this.http.post<Utilisateur>(
      `${this.apiUrl}/users`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Utilisateur>('createUtilisateur'))
    );
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUtilisateur(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    // Préparer les données pour l'API
    const { mot_de_passe_hash, idUtilisateur, ...userData } = utilisateur;
    const payload: any = { ...userData };
    
    // Inclure le mot de passe seulement s'il est fourni
    if (utilisateur.mot_de_passe) {
      payload.mot_de_passe = utilisateur.mot_de_passe;
    }

    return this.http.put<Utilisateur>(
      `${this.apiUrl}/users/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Utilisateur>('updateUtilisateur'))
    );
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUtilisateur(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/users/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deleteUtilisateur', false))
    );
  }

  /**
   * Désactiver/Activer un utilisateur
   */
  toggleActif(id: number, actif: boolean): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/users/${id}/actif`,
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

