import { Injectable } from '@angular/core';
import { Observable, throwError, of, delay } from 'rxjs';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly STORAGE_KEY = 'local_reservations';

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
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const defaultReservations: Reservation[] = [
        {
          id_reservation: 1,
          id_client: 1,
          date_reservation: today.toISOString(),
          date_debut: tomorrow.toISOString().split('T')[0],
          date_fin: nextWeek.toISOString().split('T')[0],
          montant_total: 3500.00,
          statut_reservation: 'Confirmée',
          remise_appliquee: 0.00
        },
        {
          id_reservation: 2,
          id_client: 2,
          date_reservation: today.toISOString(),
          date_debut: tomorrow.toISOString().split('T')[0],
          date_fin: nextWeek.toISOString().split('T')[0],
          montant_total: 2100.00,
          statut_reservation: 'En attente',
          remise_appliquee: 100.00
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultReservations));
    }
  }

  /**
   * Récupère toutes les réservations du stockage local
   */
  private getLocalReservations(): Reservation[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde les réservations dans le stockage local
   */
  private saveLocalReservations(reservations: Reservation[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reservations));
  }

  /**
   * Génère un nouvel ID pour une réservation
   */
  private getNextId(): number {
    const reservations = this.getLocalReservations();
    if (reservations.length === 0) return 1;
    return Math.max(...reservations.map(r => r.id_reservation || 0)) + 1;
  }

  /**
   * Récupérer toutes les réservations (local)
   */
  getAllReservations(): Observable<Reservation[]> {
    const reservations = this.getLocalReservations();
    return of(reservations).pipe(delay(300));
  }

  /**
   * Récupérer une réservation par ID (local)
   */
  getReservationById(id: number): Observable<Reservation> {
    const reservations = this.getLocalReservations();
    const reservation = reservations.find(r => r.id_reservation === id);
    
    if (!reservation) {
      return throwError(() => new Error(`Réservation avec l'ID ${id} non trouvée`));
    }
    
    return of({ ...reservation }).pipe(delay(200));
  }

  /**
   * Créer une nouvelle réservation (local)
   */
  createReservation(reservation: Reservation): Observable<Reservation> {
    const reservations = this.getLocalReservations();
    
    // Créer la nouvelle réservation
    const newReservation: Reservation = {
      ...reservation,
      id_reservation: this.getNextId(),
      date_reservation: reservation.date_reservation || new Date().toISOString(),
      remise_appliquee: reservation.remise_appliquee || 0.00
    };
    
    reservations.push(newReservation);
    this.saveLocalReservations(reservations);
    
    return of({ ...newReservation }).pipe(delay(300));
  }

  /**
   * Mettre à jour une réservation (local)
   */
  updateReservation(id: number, reservation: Reservation): Observable<Reservation> {
    const reservations = this.getLocalReservations();
    const index = reservations.findIndex(r => r.id_reservation === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Réservation avec l'ID ${id} non trouvée`));
    }
    
    // Mettre à jour la réservation
    const updatedReservation: Reservation = {
      ...reservations[index],
      ...reservation,
      id_reservation: id // S'assurer que l'ID ne change pas
    };
    
    reservations[index] = updatedReservation;
    this.saveLocalReservations(reservations);
    
    return of({ ...updatedReservation }).pipe(delay(300));
  }

  /**
   * Supprimer une réservation (local)
   */
  deleteReservation(id: number): Observable<boolean> {
    const reservations = this.getLocalReservations();
    const index = reservations.findIndex(r => r.id_reservation === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Réservation avec l'ID ${id} non trouvée`));
    }
    
    reservations.splice(index, 1);
    this.saveLocalReservations(reservations);
    
    return of(true).pipe(delay(300));
  }
}

