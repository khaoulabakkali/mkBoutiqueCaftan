import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reservation, ReservationArticle, StatutReservation, StatutReservationEnum, StatutReservationMapping, StatutReservationReverseMapping } from '../models/reservation.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
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
   * Convertir la valeur numérique de l'enum API vers la valeur string du frontend
   */
  private mapStatutFromApi(statutValue: number | string | undefined): StatutReservation {
    if (statutValue === undefined || statutValue === null) {
      return 'En attente';
    }
    
    // Si c'est déjà une string valide, la retourner telle quelle
    if (typeof statutValue === 'string') {
      const validStatuts: StatutReservation[] = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];
      if (validStatuts.includes(statutValue as StatutReservation)) {
        return statutValue as StatutReservation;
      }
    }
    
    // Convertir la valeur numérique vers la string correspondante
    const enumValue = statutValue as StatutReservationEnum;
    return StatutReservationMapping[enumValue] || 'En attente';
  }

  /**
   * Convertir la valeur string du frontend vers la valeur numérique de l'enum API
   */
  private mapStatutToApi(statutString: string): number {
    return StatutReservationReverseMapping[statutString] ?? StatutReservationEnum.EnAttente;
  }

  /**
   * Mapper les données de l'API (PascalCase) vers le modèle (camelCase)
   */
  private mapApiToModel(data: any): Reservation {
    // L'API peut envoyer StatutReservation comme nombre (enum) ou comme string
    const statutValue = data.statutReservation;
    
    return {
      idReservation: data.idReservation,
      idClient: data.idClient,
      dateReservation: data.dateReservation,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      montantTotal: data.montantTotal,
      statutReservation: this.mapStatutFromApi(statutValue),
      idPaiement: data.idPaiement,
      remiseAppliquee: data.remiseAppliquee,
      articles: data.articles,
      client: data.client
    };
  }

  /**
   * Récupérer toutes les réservations
   */
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/reservations`,
      this.getHttpOptions()
    ).pipe(
      map(data => Array.isArray(data) ? data.map(item => this.mapApiToModel(item)) : []),
      catchError(this.handleError<Reservation[]>('getAllReservations', []))
    );
  }

  /**
   * Récupérer une réservation par ID
   */
  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<any>(
      `${this.apiUrl}/reservations/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(data => this.mapApiToModel(data)),
      catchError(this.handleError<Reservation>('getReservationById'))
    );
  }

  /**
   * Créer une nouvelle réservation
   */
  createReservation(reservation: Reservation): Observable<Reservation> {
    const payload: any = {
      idClient: reservation.idClient,
      dateReservation: reservation.dateReservation,
      dateDebut: reservation.dateDebut,
      dateFin: reservation.dateFin,
      montantTotal: reservation.montantTotal,
      statutReservation: this.mapStatutToApi(reservation.statutReservation),
      idPaiement: reservation.idPaiement || undefined,
      remiseAppliquee: reservation.remiseAppliquee || 0.00
    };

    // Ajouter les articles si présents
    if (reservation.articles && reservation.articles.length > 0) {
      payload.articles = reservation.articles.map(article => ({
        idArticle: article.idArticle,
        quantite: article.quantite
      }));
    }

    return this.http.post<any>(
      `${this.apiUrl}/reservations`,
      payload,
      this.getHttpOptions()
    ).pipe(
      map(data => this.mapApiToModel(data)),
      catchError(this.handleError<Reservation>('createReservation'))
    );
  }

  /**
   * Mettre à jour une réservation
   */
  updateReservation(id: number, reservation: Reservation): Observable<Reservation> {
    const payload = {
      IdClient: reservation.idClient,
      DateReservation: reservation.dateReservation,
      DateDebut: reservation.dateDebut,
      DateFin: reservation.dateFin,
      MontantTotal: reservation.montantTotal,
      StatutReservation: this.mapStatutToApi(reservation.statutReservation),
      IdPaiement: reservation.idPaiement || undefined,
      RemiseAppliquee: reservation.remiseAppliquee || 0.00
    };

    return this.http.put<any>(
      `${this.apiUrl}/reservations/${id}`,
      payload,
      this.getHttpOptions()
    ).pipe(
      map(data => this.mapApiToModel(data)),
      catchError(this.handleError<Reservation>('updateReservation'))
    );
  }

  /**
   * Supprimer une réservation
   */
  deleteReservation(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/reservations/${id}`,
      this.getHttpOptions()
    ).pipe(
      map(() => true),
      catchError(this.handleError<boolean>('deleteReservation', false))
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
