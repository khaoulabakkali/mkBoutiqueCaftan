import { Reservation } from './reservation.model';

/**
 * Modèle Paiement
 * Correspond à la structure C# du backend
 */
export interface Paiement {
  /** INTEGER - Clé primaire, auto-increment */
  idPaiement?: number;
  
  /** INTEGER - Lien vers la réservation (FK vers Reservations) */
  idReservation: number;
  
  /** DECIMAL(10, 2) - Montant du paiement */
  montant: number;
  
  /** DATETIME - Date et heure du paiement */
  datePaiement: string;
  
  /** VARCHAR(50) - Méthode de paiement (Espèces, Carte, Chèque, etc.) */
  methodePaiement?: string;
  
  /** VARCHAR(100) - Référence du paiement (numéro de transaction, chèque, etc.) */
  reference?: string;
  
  /** Propriété de navigation */
  reservation?: Reservation;
}
