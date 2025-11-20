/**
 * Modèle Client
 * Correspond à la structure C# du backend
 */
export interface Client {
  /** INTEGER - Clé primaire, auto-increment */
  idClient?: number;
  
  /** VARCHAR(100) - Nom du client */
  nomClient: string;
  
  /** VARCHAR(100) - Prénom du client (optionnel) */
  prenomClient?: string;
  
  /** VARCHAR(20) - Numéro de téléphone (unique) */
  telephone: string;
  
  /** VARCHAR(100) - Adresse email (optionnel) */
  email?: string;
  
  /** TEXT - Adresse principale (optionnel) */
  adressePrincipale?: string;
  
  /** INTEGER - Nombre total de commandes (défaut: 0) */
  totalCommandes: number;
  
  /** DATETIME - Date de création de la fiche */
  dateCreationFiche?: string;
  
  /** BOOLEAN - Statut actif/inactif */
  actif?: boolean;
}

