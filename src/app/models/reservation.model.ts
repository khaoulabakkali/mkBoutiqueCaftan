/**
 * Modèle Reservation
 * Pour la gestion des réservations dans l'application
 * 
 * Structure de la table reservations (si base de données) :
 * - id_reservation: INTEGER (clé primaire, auto-increment)
 * - id_client: INTEGER FK (référence à Clients)
 * - date_reservation: DATETIME NOT NULL
 * - date_debut: DATE NOT NULL
 * - date_fin: DATE NOT NULL
 * - montant_total: DECIMAL(10, 2) NOT NULL
 * - statut_reservation: ENUM NOT NULL (En attente, Confirmée, En cours, Terminée, Annulée)
 * - id_paiement: INTEGER FK (référence à Paiements) - optionnel
 * - remise_appliquee: DECIMAL(10, 2) NOT NULL (Défaut 0.00)
 */
export type StatutReservation = 'En attente' | 'Confirmée' | 'En cours' | 'Terminée' | 'Annulée';

export interface Reservation {
  /** INTEGER - Clé primaire, auto-increment */
  id_reservation?: number;
  
  /** INTEGER - Lien vers le client (FK vers Clients) */
  id_client: number;
  
  /** DATETIME - Date et heure de création de la réservation */
  date_reservation: string;
  
  /** DATE - Date à laquelle la location commence (jour de prise en charge) */
  date_debut: string;
  
  /** DATE - Date à laquelle la location se termine (jour de retour) */
  date_fin: string;
  
  /** DECIMAL(10, 2) - Montant total final de la réservation (inclut remise, taxes) */
  montant_total: number;
  
  /** ENUM - État actuel de la réservation */
  statut_reservation: StatutReservation;
  
  /** INTEGER - Lien vers la table des paiements (FK vers Paiements) - optionnel */
  id_paiement?: number;
  
  /** DECIMAL(10, 2) - Montant ou pourcentage de la remise de fidélité appliquée (défaut: 0.00) */
  remise_appliquee: number;
}

