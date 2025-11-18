/**
 * Modèle Categorie
 * Pour la gestion des catégories dans l'application
 * 
 * Structure de la table categories (si base de données) :
 * - idCategorie: INTEGER (clé primaire, auto-increment)
 * - nomCategorie: VARCHAR(50) NOT NULL, UNIQUE
 * - description: TEXT NULLABLE
 * - ordreAffichage: INTEGER NULLABLE
 */
export interface Categorie {
  /** INTEGER - Clé primaire, auto-increment */
  idCategorie?: number;
  
  /** VARCHAR(50) - Nom de la catégorie (ex: 'Caftans', 'Tekchitas', 'Sacs', 'Talons', 'Accessoires') */
  nomCategorie: string;
  
  /** TEXT - Description optionnelle de ce que contient la catégorie */
  description?: string;
  
  /** INTEGER - Permet de contrôler l'ordre dans lequel les catégories apparaissent dans le menu */
  ordreAffichage?: number;
}

