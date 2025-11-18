/**
 * Modèle Categorie
 * Pour la gestion des catégories dans l'application
 * 
 * Structure de la table categories (si base de données) :
 * - id_categorie: INTEGER (clé primaire, auto-increment)
 * - nom_categorie: VARCHAR(50) NOT NULL, UNIQUE
 * - description: TEXT NULLABLE
 * - ordre_affichage: INTEGER NULLABLE
 */
export interface Categorie {
  /** INTEGER - Clé primaire, auto-increment */
  id_categorie?: number;
  
  /** VARCHAR(50) - Nom de la catégorie (ex: 'Caftans', 'Tekchitas', 'Sacs', 'Talons', 'Accessoires') */
  nom_categorie: string;
  
  /** TEXT - Description optionnelle de ce que contient la catégorie */
  description?: string;
  
  /** INTEGER - Permet de contrôler l'ordre dans lequel les catégories apparaissent dans le menu */
  ordre_affichage?: number;
}

