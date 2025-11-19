/**
 * Modèle Societe
 * Pour la gestion des sociétés dans l'application
 * 
 * Structure de la table societes (si base de données) :
 * - IdSociete: INTEGER (clé primaire, auto-increment)
 * - NomSociete: VARCHAR(100) NOT NULL
 * - Description: TEXT NULLABLE
 * - Adresse: TEXT NULLABLE
 * - Telephone: VARCHAR(20) NULLABLE
 * - Email: VARCHAR(100) NULLABLE
 * - SiteWeb: VARCHAR(200) NULLABLE
 * - Logo: TEXT NULLABLE
 * - Actif: BOOLEAN NOT NULL (Défaut true)
 * - DateCreation: DATETIME NOT NULL
 */
export interface Societe {
  /** INTEGER - Clé primaire, auto-increment */
  idSociete?: number;
  
  /** VARCHAR(100) - Nom de la société */
  nomSociete: string;
  
  /** TEXT - Description de la société */
  description?: string;
  
  /** TEXT - Adresse de la société */
  adresse?: string;
  
  /** VARCHAR(20) - Numéro de téléphone */
  telephone?: string;
  
  /** VARCHAR(100) - Adresse email */
  email?: string;
  
  /** VARCHAR(200) - Site web */
  siteWeb?: string;
  
  /** TEXT - Logo (base64 ou URL) */
  logo?: string;
  
  /** BOOLEAN - Indique si la société est active */
  actif: boolean;
  
  /** DATETIME - Date de création */
  dateCreation?: string;
}

