/**
 * Modèle Reservation
 * Correspond à la structure C# du backend
 */

/**
 * Enum StatutReservation correspondant à l'enum C# du backend
 */
export enum StatutReservationEnum {
  EnAttente = 0,      // Réservation créée mais non confirmée
  Confirmee = 1,      // Réservation confirmée
  EnCours = 2,        // Location en cours
  Terminee = 3,       // Location terminée
  Annulee = 4         // Réservation annulée
}

/**
 * Type pour l'affichage dans le frontend (valeurs string lisibles)
 */
export type StatutReservation = 'En attente' | 'Confirmée' | 'En cours' | 'Terminée' | 'Annulée';

/**
 * Mapping entre les valeurs numériques de l'API et les valeurs string du frontend
 */
export const StatutReservationMapping = {
  [StatutReservationEnum.EnAttente]: 'En attente' as StatutReservation,
  [StatutReservationEnum.Confirmee]: 'Confirmée' as StatutReservation,
  [StatutReservationEnum.EnCours]: 'En cours' as StatutReservation,
  [StatutReservationEnum.Terminee]: 'Terminée' as StatutReservation,
  [StatutReservationEnum.Annulee]: 'Annulée' as StatutReservation
};

/**
 * Mapping inverse : string → enum numérique
 */
export const StatutReservationReverseMapping: { [key: string]: StatutReservationEnum } = {
  'En attente': StatutReservationEnum.EnAttente,
  'Confirmée': StatutReservationEnum.Confirmee,
  'En cours': StatutReservationEnum.EnCours,
  'Terminée': StatutReservationEnum.Terminee,
  'Annulée': StatutReservationEnum.Annulee
};

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

