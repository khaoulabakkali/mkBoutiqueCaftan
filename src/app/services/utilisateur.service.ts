import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Utilisateur } from '../models/utilisateur.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
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
   * Récupérer tous les utilisateurs
   */
  getAllUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(
      `${this.apiUrl}/utilisateurs`,
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
      `${this.apiUrl}/utilisateurs/${id}`,
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
      `${this.apiUrl}/utilisateurs`,
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
    const { mot_de_passe_hash, id_utilisateur, ...userData } = utilisateur;
    const payload: any = { ...userData };
    
    // Inclure le mot de passe seulement s'il est fourni
    if (utilisateur.mot_de_passe) {
      payload.mot_de_passe = utilisateur.mot_de_passe;
    }

    return this.http.put<Utilisateur>(
      `${this.apiUrl}/utilisateurs/${id}`,
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
      `${this.apiUrl}/utilisateurs/${id}`,
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
      `${this.apiUrl}/utilisateurs/${id}/actif`,
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
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'Une erreur est survenue';
      
      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Erreur côté serveur
        if (error.status === 401) {
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
          // Optionnel: déconnecter l'utilisateur
          // this.authService.logout();
        } else if (error.status === 403) {
          errorMessage = 'Accès interdit.';
        } else if (error.status === 404) {
          errorMessage = 'Ressource non trouvée.';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.error) {
          // Essayer d'extraire le message d'erreur de différentes façons
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.errors && Array.isArray(error.error.errors)) {
            // Gérer les erreurs de validation multiples
            errorMessage = error.error.errors.map((e: any) => e.message || e).join(', ');
          }
        }
      }

      // Retourner une erreur observable avec le message
      return throwError(() => new Error(errorMessage));
    };
  }
}

