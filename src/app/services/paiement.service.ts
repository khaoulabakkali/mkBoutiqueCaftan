import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Paiement } from '../models/paiement.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
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
   * Mapper les données de l'API (PascalCase) vers le modèle (camelCase)
   */
  private mapApiToModel(data: any): Paiement {
    return {
      idPaiement: data.IdPaiement || data.idPaiement,
      idReservation: data.IdReservation || data.idReservation,
      montant: data.Montant || data.montant,
      datePaiement: data.DatePaiement || data.datePaiement,
      methodePaiement: data.MethodePaiement || data.methodePaiement,
      reference: data.Reference || data.reference,
      reservation: data.Reservation || data.reservation
    };
  }

  /**
   * Récupérer tous les paiements
   */
  getAllPaiements(): Observable<Paiement[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/paiements`,
      this.getHttpOptions()
    ).pipe(
      map(data => Array.isArray(data) ? data.map(item => this.mapApiToModel(item)) : []),
      catchError(this.handleError<Paiement[]>('getAllPaiements', []))
    );
  }

  /**
   * Récupérer un paiement par ID
   */
  getPaiementById(id: number): Observable<Paiement> {
    return this.http.get<any>(
      `${this.apiUrl}/paiements/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(data => this.mapApiToModel(data)),
      catchError(this.handleError<Paiement>('getPaiementById'))
    );
  }

  /**
   * Créer un nouveau paiement
   */
  createPaiement(paiement: Paiement): Observable<Paiement> {
    const payload = {
      IdReservation: paiement.idReservation,
      Montant: paiement.montant,
      DatePaiement: paiement.datePaiement,
      MethodePaiement: paiement.methodePaiement || undefined,
      Reference: paiement.reference || undefined
    };

    return this.http.post<any>(
      `${this.apiUrl}/paiements`,
      payload,
      this.getHttpOptions()
    ).pipe(
      map(data => this.mapApiToModel(data)),
      catchError(this.handleError<Paiement>('createPaiement'))
    );
  }

  /**
   * Mettre à jour un paiement
   */
  updatePaiement(id: number, paiement: Paiement): Observable<Paiement> {
    const payload = {
      IdReservation: paiement.idReservation,
      Montant: paiement.montant,
      DatePaiement: paiement.datePaiement,
      MethodePaiement: paiement.methodePaiement || undefined,
      Reference: paiement.reference || undefined
    };

    return this.http.put<any>(
      `${this.apiUrl}/paiements/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      map(data => this.mapApiToModel(data)),
      catchError(this.handleError<Paiement>('updatePaiement'))
    );
  }

  /**
   * Supprimer un paiement
   */
  deletePaiement(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/paiements/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deletePaiement', false))
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
