/**
 * Modèle Reservation
 * Correspond à la structure C# du backend
 */
export type StatutReservation = 'En attente' | 'Confirmée' | 'En cours' | 'Terminée' | 'Annulée';

export interface Reservation {
  /** INTEGER - Clé primaire, auto-increment */
  idReservation?: number;
  
  /** INTEGER - Lien vers le client (FK vers Clients) */
  idClient: number;
  
  /** DATETIME - Date et heure de création de la réservation */
  dateReservation: string;
  
  /** DATE - Date à laquelle la location commence (jour de prise en charge) */
  dateDebut: string;
  
  /** DATE - Date à laquelle la location se termine (jour de retour) */
  dateFin: string;
  
  /** DECIMAL(10, 2) - Montant total final de la réservation (inclut remise, taxes) */
  montantTotal: number;
  
  /** ENUM - État actuel de la réservation */
  statutReservation: StatutReservation;
  
  /** INTEGER - Lien vers la table des paiements (FK vers Paiements) - optionnel */
  idPaiement?: number;
  
  /** DECIMAL(10, 2) - Montant ou pourcentage de la remise de fidélité appliquée (défaut: 0.00) */
  remiseAppliquee: number;
  
  /** Navigation property */
  client?: any;
}

