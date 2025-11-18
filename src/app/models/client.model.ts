/**
 * Modèle Client
 * Correspond à la structure de la table clients dans la base de données
 * 
 * Structure de la table :
 * - id_client: INTEGER (clé primaire, auto-increment)
 * - nom_client: VARCHAR(100) NOT NULL
 * - prenom_client: VARCHAR(100) NOT NULL
 * - telephone: VARCHAR(20) NOT NULL, UNIQUE
 * - email: VARCHAR(100) NULLABLE
 * - adresse_principale: TEXT NULLABLE
 * - total_commandes: INTEGER NOT NULL (Défaut 0)
 * - date_creation_fiche: DATETIME NOT NULL
 */
export interface Client {
  /** INTEGER - Clé primaire, auto-increment */
  id_client?: number;
  
  /** VARCHAR(100) - Nom du client */
  nom_client: string;
  
  /** VARCHAR(100) - Prénom du client */
  prenom_client: string;
  
  /** VARCHAR(20) - Numéro de téléphone (unique) */
  telephone: string;
  
  /** VARCHAR(100) - Adresse email (optionnel) */
  email?: string;
  
  /** TEXT - Adresse principale (optionnel) */
  adresse_principale?: string;
  
  /** INTEGER - Nombre total de commandes (défaut: 0) */
  total_commandes: number;
  
  /** DATETIME - Date de création de la fiche */
  date_creation_fiche?: string;
}

