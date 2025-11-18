/**
 * Modèle Taille
 * Pour la gestion des tailles dans l'application
 * 
 * Structure de la table tailles (si base de données) :
 * - id_taille: INTEGER (clé primaire, auto-increment)
 * - taille: VARCHAR(20) NOT NULL, UNIQUE
 */
export interface Taille {
  /** INTEGER - Clé primaire, auto-increment */
  id_taille?: number;
  
  /** VARCHAR(20) - Libellé de la taille (ex: XS, S, M, L, XL, XXL) */
  taille: string;
}

