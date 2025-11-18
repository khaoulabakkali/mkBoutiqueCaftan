import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Role } from '../models/role.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
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
   * Récupérer tous les rôles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(
      `${this.apiUrl}/roles`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Role[]>('getAllRoles', []))
    );
  }

  /**
   * Récupérer tous les rôles actifs
   */
  getActiveRoles(): Observable<Role[]> {
    return this.getAllRoles().pipe(
      map(roles => roles.filter(role => role.actif)),
      catchError(this.handleError<Role[]>('getActiveRoles', []))
    );
  }

  /**
   * Récupérer un rôle par ID
   */
  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(
      `${this.apiUrl}/roles/${id}`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Role>('getRoleById'))
    );
  }

  /**
   * Créer un nouveau rôle
   */
  createRole(role: Role): Observable<Role> {
    // Préparer les données pour l'API
    const payload = {
      nomRole: role.nomRole.toUpperCase(), // Toujours en majuscules
      description: role.description || undefined,
      actif: role.actif !== undefined ? role.actif : true
    };

    return this.http.post<Role>(
      `${this.apiUrl}/roles`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Role>('createRole'))
    );
  }

  /**
   * Mettre à jour un rôle
   */
  updateRole(id: number, role: Role): Observable<Role> {
    // Préparer les données pour l'API
    const payload = {
      nomRole: role.nomRole.toUpperCase(), // Toujours en majuscules
      description: role.description || undefined,
      actif: role.actif !== undefined ? role.actif : true
    };

    return this.http.put<Role>(
      `${this.apiUrl}/roles/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Role>('updateRole'))
    );
  }

  /**
   * Supprimer un rôle
   */
  deleteRole(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/roles/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deleteRole', false))
    );
  }

  /**
   * Désactiver/Activer un rôle
   */
  toggleActif(id: number, actif: boolean): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiUrl}/roles/${id}/actif`,
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
