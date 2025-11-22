import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
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
   * Récupérer tous les clients
   */
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(
      `${this.apiUrl}/clients`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Client[]>('getAllClients', []))
    );
  }

  /**
   * Récupérer un client par ID
   */
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(
      `${this.apiUrl}/clients/${id}`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Client>('getClientById'))
    );
  }

  /**
   * Créer un nouveau client
   */
  createClient(client: Client): Observable<Client> {
    const payload = {
      nomClient: client.nomClient?.trim() || '',
      prenomClient: client.prenomClient?.trim() || undefined,
      telephone: client.telephone?.trim() || '',
      email: client.email?.trim() || undefined,
      adressePrincipale: client.adressePrincipale?.trim() || undefined,
      totalCommandes: client.totalCommandes || 0,
      actif: client.actif !== undefined ? client.actif : true
    };
    
    // Retirer prenomClient du payload s'il est vide
    if (!payload.prenomClient || payload.prenomClient === '') {
      delete (payload as any).prenomClient;
    }

    return this.http.post<Client>(
      `${this.apiUrl}/clients`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Client>('createClient'))
    );
  }

  /**
   * Mettre à jour un client
   */
  updateClient(id: number, client: Client): Observable<Client> {
    const payload = {
      nomClient: client.nomClient?.trim() || '',
      prenomClient: client.prenomClient?.trim() || undefined,
      telephone: client.telephone?.trim() || '',
      email: client.email?.trim() || undefined,
      adressePrincipale: client.adressePrincipale?.trim() || undefined,
      totalCommandes: client.totalCommandes || 0,
      actif: client.actif !== undefined ? client.actif : true
    };
    
    // Retirer prenomClient du payload s'il est vide
    if (!payload.prenomClient || payload.prenomClient === '') {
      delete (payload as any).prenomClient;
    }

    return this.http.put<Client>(
      `${this.apiUrl}/clients/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError<Client>('updateClient'))
    );
  }

  /**
   * Supprimer un client
   */
  deleteClient(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/clients/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deleteClient', false))
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
