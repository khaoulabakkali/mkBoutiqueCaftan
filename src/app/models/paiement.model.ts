import { Reservation } from './reservation.model';

/**
 * Modèle Paiement
 * Pour la gestion des paiements dans l'application
 * 
 * Structure de la table paiements (si base de données) :
 * - IdPaiement: INTEGER (clé primaire, auto-increment)
 * - IdReservation: INTEGER FK (référence à Reservations) NOT NULL
 * - Montant: DECIMAL(10, 2) NOT NULL
 * - DatePaiement: DATETIME NOT NULL
 * - MethodePaiement: VARCHAR(50) NULLABLE (Espèces, Carte, Chèque, etc.)
 * - Reference: VARCHAR(100) NULLABLE (Numéro de transaction, référence chèque, etc.)
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
